import subprocess
import os
import sys

REPOS = [
    ("rea", "https://github.com/morluto/rea.git"),
    ("openclaw", "https://github.com/openclaw/openclaw.git"),
    ("clawhub", "https://github.com/openclaw/clawhub.git"),
    ("openmausbot", "https://github.com/milind-soni/OpenMausBot.git"),
    ("postiz", "https://github.com/gitroomhq/postiz-app.git"),
    ("trypost", "https://github.com/trypostit/trypost.git"),
    ("social-media-skills", "https://github.com/social-media-skills/skills.git"),
    ("instagram-skills", "https://github.com/sergebulaev/instagram-skills.git"),
    ("instagram-agent-skill", "https://github.com/Jakeschincariol/instagram-agent-skill.git"),
    ("youtube-automation-agent", "https://github.com/darkzOGx/youtube-automation-agent.git"),
    ("linkedin-skills", "https://github.com/sergebulaev/linkedin-skills.git"),
    ("social-research-skills", "https://github.com/ScrapeCreators/social-media-research-skills.git"),
    ("agent-reach", "https://github.com/Panniantong/Agent-Reach.git"),
    ("last30days-skill", "https://github.com/mvanhorn/last30days-skill.git"),
]

os.makedirs(".rea_staging", exist_ok=True)

for name, url in REPOS:
    dest = os.path.join(".rea_staging", name)
    if not os.path.exists(dest):
        print(f"[*] Cloning {name} from {url}...")
        res = subprocess.run(["git", "clone", "--depth", "1", url, dest], capture_output=True, text=True)
        if res.returncode == 0:
            print(f"[+] Cloned {name} successfully.")
        else:
            print(f"[-] Could not clone {name}: {res.stderr.strip() or res.stdout.strip()}")
    else:
        print(f"[=] {name} already exists.")
