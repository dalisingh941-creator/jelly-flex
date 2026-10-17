import asyncio
import json
import os
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

from security.fernet_vault import HardwareFernetVault
from security.gateway_guard import TrustedGatewayGuard
from security.byok_manager import BYOKVaultManager
from security.uninstaller_engine import CleanUninstallerAndShredder
from agents.lane_queue import OpenClawLaneQueue
from agents.orchestrator import JellyFlexOrchestrator
from agents.viral_simulator import ViralHookAndShadowbanSimulator
from agents.content_waterfall import OmniChannelWaterfallEngine
from agents.cron_lease_manager import CronLeaseManager
from agents.antigravity_bridge import AntigravitySDKBridge
from agents.rea_engine import REACleanRoomEngine
from apps_registry.stealth_browser import StealthBrowserHumanizer
from apps_registry.google_drive_sync import GoogleDriveCipherSync
from apps_registry.omni_social_adapters import OmniSocialRegistry
from agents.agno_os_system import AgnoOSCoreManager
from security.invite_auth import InviteCodeAuthManager
from agents.agent_store import AgentManagerStore
from agents.multi_agent_coordinator import MultiAgentChatCoordinator

app = FastAPI(
    title="JellyFlex 2.0 Core Gateway",
    description="Clean-room local-first social automation suite with OpenClaw 2.0 subsystems, Agno OS & Google Antigravity SDK",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

class TaskApprovalGate:
    def __init__(self):
        self.event = asyncio.Event()
        self.approved: bool = False


# Core subsystems initialization
vault = HardwareFernetVault()
gateway_guard = TrustedGatewayGuard()
lane_queue = OpenClawLaneQueue()
byok_manager = BYOKVaultManager(vault=vault)
orchestrator = JellyFlexOrchestrator(byok_manager=byok_manager)
uninstaller = CleanUninstallerAndShredder()
viral_simulator = ViralHookAndShadowbanSimulator()
waterfall_engine = OmniChannelWaterfallEngine(orchestrator=orchestrator)
cron_manager = CronLeaseManager()
antigravity_bridge = AntigravitySDKBridge()
rea_engine = REACleanRoomEngine()
stealth_humanizer = StealthBrowserHumanizer()
gdrive_sync = GoogleDriveCipherSync(vault=vault)
social_registry = OmniSocialRegistry()
agno_os_manager = AgnoOSCoreManager(db_path="backend/data/agno_os.db")
agno_os_manager.mount_to_fastapi(app)
invite_auth = InviteCodeAuthManager(db_path=vault.db_path)
agent_store = AgentManagerStore(db_path=vault.db_path)
chat_coordinator = MultiAgentChatCoordinator(
    agent_store=agent_store,
    orchestrator=orchestrator,
    viral_simulator=viral_simulator,
)

# Event bus and permission gates
event_subscribers: List[asyncio.Queue] = []
pending_approvals: Dict[str, TaskApprovalGate] = {}
panic_locked: bool = False


async def broadcast_state(state: str, detail: str, task_id: Optional[str] = None, requires_approval: bool = False):
    payload = json.dumps({
        "state": state,
        "detail": detail,
        "task_id": task_id,
        "requires_approval": requires_approval,
    })
    for q in list(event_subscribers):
        await q.put(payload)


class AutomationTask(BaseModel):
    task_id: str
    target_channel: str = "instagram"
    objective: str
    payload: Dict[str, Any] = Field(default_factory=dict)
    require_human_approval: bool = True


class BYOKKeySubmission(BaseModel):
    provider: str
    raw_key: str
    monthly_budget_usd: float = 25.0


class ViralAuditRequest(BaseModel):
    channel: str
    content: str


class WaterfallRequest(BaseModel):
    seed_idea: str
    channels: Optional[List[str]] = None


@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "online" if not panic_locked else "PANIC_LOCKED",
        "framework": "JellyFlex 2.0 (Agno OS Full Framework + Google Antigravity SDK + OpenClaw 7-Subsystems)",
        "agno_os": agno_os_manager.get_os_status(),
        "doctor": vault.doctor_status,
        "loaded_skills_count": len(orchestrator.skill_registry.list_available_skills()),
        "supported_channels": social_registry.list_supported_channels(),
    }


@app.get("/api/v1/agno/os-info")
async def get_agno_os_info():
    return agno_os_manager.get_os_status()


@app.get("/api/v1/rea/summary")
async def get_rea_summary():
    return rea_engine.get_reverse_engineering_summary()


@app.get("/api/v1/rea/analyze/{repo_name}")
async def analyze_repo(repo_name: str):
    return rea_engine.analyze_target_repo(repo_name)


@app.get("/api/v1/antigravity/status")
async def antigravity_status():
    return antigravity_bridge.get_antigravity_runtime_status()


@app.get("/api/v1/skills")
async def list_skills():
    return {
        "skills": orchestrator.skill_registry.list_available_skills(),
        "platforms": list(orchestrator.skill_registry.PLATFORM_SKILL_MAP.keys()),
    }


@app.get("/api/v1/stream")
async def sse_runtime_stream():
    queue: asyncio.Queue = asyncio.Queue()
    event_subscribers.append(queue)

    async def event_generator():
        try:
            yield f"data: {json.dumps({'state': 'IDLE', 'detail': 'Connected to JellyFlex SSE Bus'})}\n\n"
            while True:
                data = await queue.get()
                yield f"data: {data}\n\n"
        except asyncio.CancelledError:
            if queue in event_subscribers:
                event_subscribers.remove(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


async def _run_task_lifecycle(task: AutomationTask):
    global panic_locked
    if panic_locked:
        await broadcast_state("ERROR", "Execution aborted: Vault is PANIC_LOCKED.", task.task_id)
        return

    try:
        await broadcast_state("THINKING", f"Running {task.target_channel} skill chain...", task.task_id)

        # Check account safety radar before running browser actions
        radar = stealth_humanizer.check_account_safety_radar(task.target_channel)
        if not radar["safe_to_proceed"]:
            await broadcast_state("ERROR", f"Safety radar alert: {radar['status']}", task.task_id)
            return

        lane_out = await lane_queue.run_in_lane(
            lane_name=task.target_channel,
            task_id=task.task_id,
            coro_factory=lambda: gateway_guard.execute_sandboxed(
                orchestrator.process_automated_pipeline(task.objective, task.target_channel)
            ),
        )

        if task.require_human_approval:
            gate = TaskApprovalGate()
            pending_approvals[task.task_id] = gate
            await broadcast_state(
                "AWAITING_APPROVAL",
                f"Approve {task.target_channel.upper()} action for {task.task_id}?",
                task.task_id,
                requires_approval=True,
            )
            try:
                await asyncio.wait_for(gate.event.wait(), timeout=600.0)
            finally:
                pending_approvals.pop(task.task_id, None)

            if not gate.approved:
                await broadcast_state("IDLE", f"Task {task.task_id} was rejected by user or panic lock. Flow terminated.", task.task_id)
                return

        await broadcast_state("SYNCING", "Encrypting state via PBKDF2HMAC Fernet...", task.task_id)
        await vault.save_encrypted_event_async(
            task.task_id,
            task.target_channel,
            json.dumps(lane_out),
            fifo_seq=lane_out["fifo_seq"],
        )
        await broadcast_state("COMPLETED", f"Task {task.task_id} completed in lane {task.target_channel}.", task.task_id)

    except asyncio.TimeoutError:
        await broadcast_state("ERROR", f"Task {task.task_id} timed out awaiting approval.", task.task_id)
    except Exception as exc:
        await broadcast_state("ERROR", f"Execution halted: {exc}", task.task_id)


@app.post("/api/v1/execute")
async def execute_automation_flow(task: AutomationTask, background_tasks: BackgroundTasks):
    if panic_locked:
        raise HTTPException(status_code=403, detail="Runtime is in PANIC_LOCK mode. Unlock first.")
    background_tasks.add_task(_run_task_lifecycle, task)
    return {"status": "queued", "task_id": task.task_id, "channel": task.target_channel}


@app.post("/api/v1/approve/{task_id}")
async def approve_pending_task(task_id: str):
    if task_id not in pending_approvals:
        raise HTTPException(status_code=404, detail="No pending approval for this task_id.")
    gate = pending_approvals[task_id]
    gate.approved = True
    gate.event.set()
    return {"status": "approved", "task_id": task_id}


@app.post("/api/v1/deny/{task_id}")
async def deny_pending_task(task_id: str):
    if task_id not in pending_approvals:
        raise HTTPException(status_code=404, detail="No pending approval for this task_id.")
    gate = pending_approvals[task_id]
    gate.approved = False
    gate.event.set()
    await broadcast_state("IDLE", f"Task {task_id} rejected by user.", task_id)
    return {"status": "denied", "task_id": task_id}


@app.post("/api/v1/waterfall")
async def generate_omni_waterfall(req: WaterfallRequest):
    result = await waterfall_engine.generate_waterfall(req.seed_idea, req.channels)
    return {"status": "success", "results": result}


@app.post("/api/v1/audit/viral-hook")
async def audit_viral_hook(req: ViralAuditRequest):
    return viral_simulator.evaluate_draft(req.channel, req.content)


@app.get("/api/v1/security/byok/status")
async def list_byok_status():
    return {"providers": byok_manager.list_public_provider_status()}


@app.post("/api/v1/security/byok/keys")
async def save_byok_key(sub: BYOKKeySubmission):
    result = byok_manager.save_provider_key(sub.provider, sub.raw_key, sub.monthly_budget_usd)
    # If Gemini key was updated, sync to orchestrator
    if sub.provider.lower() == "gemini":
        orchestrator.api_key = sub.raw_key
        agno_os_manager.update_gemini_key(sub.raw_key)
    return result


@app.post("/api/v1/security/panic-lock")
async def trigger_panic_lock():
    global panic_locked
    panic_locked = True
    # Drain active gateway tasks
    drained = await gateway_guard.graceful_drain()
    # Cancel pending approvals immediately
    for gate in list(pending_approvals.values()):
        gate.approved = False
        gate.event.set()
    pending_approvals.clear()
    await broadcast_state("ERROR", "EMERGENCY PANIC LOCK ENGAGED: All lanes frozen, vault sealed.")
    return {"status": "PANIC_LOCKED", "drained_tasks": drained}


@app.post("/api/v1/security/panic-unlock")
async def release_panic_lock():
    global panic_locked
    panic_locked = False
    await broadcast_state("IDLE", "Panic lock released. Runtime operational.")
    return {"status": "UNLOCKED"}


@app.post("/api/v1/security/uninstall-shred")
async def uninstall_and_shred():
    result = uninstaller.execute_clean_uninstall(shred_user_vault=True, remove_dependencies=False)
    await broadcast_state("ERROR", "3-Pass Cryptographic Shred complete. System wiping.")
    return result


@app.get("/api/v1/backup/export")
async def export_encrypted_backup():
    return gdrive_sync.export_encrypted_backup("manual-backup")


class CreateAgentRequest(BaseModel):
    name: str
    role: str
    color: Optional[str] = "#6366f1"
    avatar_symbol: Optional[str] = "🤖"
    model: Optional[str] = "gemini-2.0-flash"
    persona: str
    instructions: str
    tools: Optional[List[str]] = None
    starters: Optional[List[str]] = None


class CreateSquadRequest(BaseModel):
    name: str
    description: str
    member_ids: List[str]
    starters: Optional[List[str]] = None


class AgentChatRequest(BaseModel):
    agent_id: str
    message: str
    conversation_id: Optional[str] = None


class SquadChatRequest(BaseModel):
    squad_id: str
    message: str
    conversation_id: Optional[str] = None


class InviteVerifyRequest(BaseModel):
    code: str


@app.get("/api/v1/auth/invite-status")
async def get_invite_status():
    return {
        "authorized": invite_auth.is_authorized(),
        "community_code_hint": "Check GitHub README for JELLYFLEX-COMMUNITY-2026",
        "has_byok_keys": byok_manager.has_configured_keys(),
    }


@app.post("/api/v1/auth/invite-verify")
async def verify_invite_code(req: InviteVerifyRequest):
    res = invite_auth.verify_and_authorize(req.code)
    if not res["success"]:
        raise HTTPException(status_code=401, detail=res["message"])
    return res


@app.get("/api/v1/agents")
async def list_all_agents():
    return {"agents": agent_store.list_agents()}


@app.post("/api/v1/agents")
async def create_new_agent(req: CreateAgentRequest):
    created = agent_store.create_custom_agent(req.model_dump())
    return {"status": "created", "agent": created}


@app.get("/api/v1/squads")
async def list_all_squads():
    return {"squads": agent_store.list_squads()}


@app.post("/api/v1/squads")
async def create_new_squad(req: CreateSquadRequest):
    created = agent_store.create_custom_squad(req.model_dump())
    return {"status": "created", "squad": created}


@app.get("/api/v1/chat/history/{conversation_id}")
async def get_chat_history(conversation_id: str):
    return {"conversation_id": conversation_id, "messages": agent_store.get_conversation_history(conversation_id)}


@app.post("/api/v1/chat/agent")
async def handle_agent_chat(req: AgentChatRequest):
    if panic_locked:
        raise HTTPException(status_code=403, detail="System is in PANIC_LOCK mode.")
    await broadcast_state("THINKING", f"Routing message to {req.agent_id}...")
    try:
        reply = await chat_coordinator.chat_one_on_one(
            agent_id=req.agent_id,
            user_message=req.message,
            conversation_id=req.conversation_id,
        )
        await broadcast_state("IDLE", f"{reply['sender_name']} delivered response.")
        return {"status": "success", "message": reply}
    except Exception as exc:
        await broadcast_state("ERROR", f"Agent chat error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/v1/chat/squad")
async def handle_squad_chat(req: SquadChatRequest):
    if panic_locked:
        raise HTTPException(status_code=403, detail="System is in PANIC_LOCK mode.")
    await broadcast_state("THINKING", f"Coordinating squad {req.squad_id} collaboration...")
    try:
        replies = await chat_coordinator.chat_squad_group(
            squad_id=req.squad_id,
            user_message=req.message,
            conversation_id=req.conversation_id,
        )
        await broadcast_state("IDLE", f"Squad {req.squad_id} completed collaboration.")
        return {"status": "success", "messages": replies}
    except Exception as exc:
        await broadcast_state("ERROR", f"Squad chat error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
