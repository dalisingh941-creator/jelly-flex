import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))
from security.invite_auth import InviteCodeAuthManager

auth = InviteCodeAuthManager()
res = auth.verify_and_authorize("JELLYFLEX-COMMUNITY-2026")
print("Community authorization result:", res)
