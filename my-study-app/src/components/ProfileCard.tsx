import { Github } from 'lucide-react';
import { LINKS } from '../constants';

export function ProfileCard() {
  return (
    <div className="dash-card profile-card">
      <img src="/profile.svg" alt="이재민 프로필" className="profile-img" width={76} height={76} />
      <div className="profile-name">이재민</div>
      <div className="profile-role">BE Developer</div>
      <a
        href={LINKS.github}
        target="_blank"
        rel="noopener noreferrer"
        className="profile-nick"
      >
        @dev-jm-1024
      </a>
      <a href="mailto:develop6013@gmail.com" className="profile-email">
        develop6013@gmail.com
      </a>
      <a
        href={LINKS.github}
        target="_blank"
        rel="noopener noreferrer"
        className="profile-github"
      >
        <Github size={15} />
        <span>GitHub</span>
      </a>
    </div>
  );
}
