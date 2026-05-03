export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Your blocks</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Drag to reorder. Toggle to publish.
      </p>
      {/* TODO MYWEB-5: block editor + live preview */}
    </div>
  );
}
