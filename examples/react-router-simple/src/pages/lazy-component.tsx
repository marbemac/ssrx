import './_index.css';

import React, { Suspense } from 'react';

const MyHeavyComponent = React.lazy(() => import('~/components/heavy-component.tsx'));

export function Component() {
  return (
    <div>
      <h2>Lazy Component</h2>

      <p>
        Just a simple component that is lazy loaded. The lazy loaded chunk should only be loaded when this page is
        visited.
      </p>

      <div>
        <Suspense fallback={<div>Loading...</div>}>
          {/* @ts-expect-error ignore */}
          <MyHeavyComponent />
        </Suspense>
      </div>
    </div>
  );
}
