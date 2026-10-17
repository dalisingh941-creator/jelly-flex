'use client';

import React, { useState } from 'react';
import { CanvasWorkspace } from '../components/CanvasWorkspace';
import { AvatarCreatorStudio } from '../components/AvatarCreatorStudio';
import { SecurityAndBYOKModal } from '../components/SecurityAndBYOKModal';
import { CustomAvatarConfig, DEFAULT_AVATAR_CONFIG } from '../components/ModularAvatarSVG';

export default function Home() {
  const [showAvatarStudio, setShowAvatarStudio] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [avatarConfig, setAvatarConfig] = useState<CustomAvatarConfig>(DEFAULT_AVATAR_CONFIG);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('jellyflex_avatar_config');
      if (saved) {
        setAvatarConfig(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const handleSaveAvatar = (cfg: CustomAvatarConfig) => {
    setAvatarConfig(cfg);
    try {
      localStorage.setItem('jellyflex_avatar_config', JSON.stringify(cfg));
    } catch (e) {}
  };

  return (
    <main className="min-h-screen">
      <CanvasWorkspace
        avatarConfig={avatarConfig}
        onOpenAvatarStudio={() => setShowAvatarStudio(true)}
        onOpenSecurityModal={() => setShowSecurityModal(true)}
      />

      {showAvatarStudio && (
        <AvatarCreatorStudio
          initialConfig={avatarConfig}
          onSaveConfig={handleSaveAvatar}
          onClose={() => setShowAvatarStudio(false)}
        />
      )}

      {showSecurityModal && (
        <SecurityAndBYOKModal
          onClose={() => setShowSecurityModal(false)}
        />
      )}
    </main>
  );
}
