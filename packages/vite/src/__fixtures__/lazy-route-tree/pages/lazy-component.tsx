import './_index.css';

export function Component() {
  // just simulating.. react would use react.lazy, etc
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const HeavyComp = import('../components/heavy-component.tsx').then(r => r.default);

  return (
    <div>
      <h2 className="home-title">My heavy component</h2>
    </div>
  );
}
