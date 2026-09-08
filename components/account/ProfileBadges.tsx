import { ROLE_LABELS, type UserRole } from "@/lib/account/types";
import {
  CodeIcon,
  CompassIcon,
  CrownIcon,
  DiscordIcon,
  GitBranchIcon,
  ShieldIcon,
  TerminalIcon,
} from "@/lib/icons";

const ROLE_ICONS: Record<Exclude<UserRole, "user">, (props: { size?: number }) => React.ReactNode> = {
  kurucu: (props) => <CrownIcon {...props} />,
  "bas-gelirtici": (props) => <TerminalIcon {...props} />,
  gelirtici: (props) => <CodeIcon {...props} />,
  "k-gelirtici": (props) => <GitBranchIcon {...props} />,
  moderator: (props) => <ShieldIcon {...props} />,
  rehber: (props) => <CompassIcon {...props} />,
};

interface ProfileBadgesProps {
  premium: boolean;
  discordUsername?: string | null;
  role: UserRole;
}

/** İkon rozetler: üzerine gelince ne oldukları görünür. */
export default function ProfileBadges({ premium, discordUsername, role }: ProfileBadgesProps) {
  const RoleIcon = role !== "user" ? ROLE_ICONS[role] : null;
  return (
    <div className="account-badges">
      {premium && (
        <span className="account-badge premium is-icon" data-tip="Premium">
          <img src="/premium.webp" alt="" width={12} height={12} />
        </span>
      )}
      {discordUsername && (
        <span className="account-badge discord is-icon" data-tip={`@${discordUsername}`}>
          <DiscordIcon size={13} />
        </span>
      )}
      {RoleIcon && (
        <span className={`account-badge role-${role} is-icon`} data-tip={ROLE_LABELS[role]}>
          <RoleIcon size={13} />
        </span>
      )}
    </div>
  );
}
