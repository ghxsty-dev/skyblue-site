"use client";

export default function DiscordWidget() {
  return (
    <div className="flex justify-center">
      <iframe
        src="https://discord.com/widget?id=1366027066293620957&theme=dark"
        width="350"
        height="500"
        allowTransparency={true}
        frameBorder="0"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        className="rounded-xl"
      />
    </div>
  );
}
