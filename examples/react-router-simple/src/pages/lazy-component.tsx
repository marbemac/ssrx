import './_index.css';

import React, { Suspense } from 'react';

const MyHeavyComponent = React.lazy(() => import('~/components/heavy-component.tsx'));

export function Component() {
  return (
    <div>
      <h2 className="home-title">My heavy component</h2>
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          {/* @ts-expect-error ignore */}
          <MyHeavyComponent />
        </Suspense>
      </div>
    </div>
  );
}
