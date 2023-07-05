import { useState } from "react";
import ReactDOM from "react-dom/client";

export default function App() {
  return (
    <html lang="en">
      <head>
        <title>Ultra 3</title>
      </head>
      <body>
        <Counter />
      </body>
    </html>
  );
}

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

if (typeof document !== "undefined") {
  ReactDOM.hydrateRoot(document, <App />);
}
