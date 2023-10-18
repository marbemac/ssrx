import { Outlet } from '@tanstack/react-router';

export function Component() {
  return (
    <>
      <div>Root layout</div>

      <div className="root-content">
        <Outlet />
      </div>
    </>
  );
}
