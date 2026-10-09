interface StudentPhotoProps {
  url: string | null | undefined;
  name: string;
  size?: "sm" | "lg";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function StudentPhoto({ url, name, size = "sm" }: StudentPhotoProps) {
  const className =
    size === "lg" ? "student-photo student-photo-lg" : "student-photo";
  if (url) {
    return (
      <div className={className}>
        <img src={url} alt={`${name}'s photo`} />
      </div>
    );
  }
  return (
    <div className={className} aria-label={`No photo for ${name}`}>
      {initials(name)}
    </div>
  );
}
