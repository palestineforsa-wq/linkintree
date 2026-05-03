export const metadata = { title: "Audience" };

export default function AudiencePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Audience</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Email captures from your email_capture blocks.
      </p>
      {/* TODO MYWEB-10: list + CSV export (gated) */}
    </div>
  );
}
