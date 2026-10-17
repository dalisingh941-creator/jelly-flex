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

  return (
    <main className="min-h-screen">
      <CanvasWorkspace
        onOpenAvatarStudio={() => setShowAvatarStudio(true)}
        onOpenSecurityModal={() => setShowSecurityModal(true)}
      />

      {showAvatarStudio && (
        <AvatarCreatorStudio
          initialConfig={avatarConfig}
          onSaveConfig={(cfg) => setAvatarConfig(cfg)}
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
