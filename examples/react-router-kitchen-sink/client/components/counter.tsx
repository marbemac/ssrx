import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button className="border px-2 py-1 rounded" onClick={() => setCount(count => count + 1)}>
      Counter: {count}
    </button>
  );
}
