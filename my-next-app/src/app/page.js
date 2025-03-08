import Counter from '../features/counter/Counter.js';
import "./globals.css";

export default function Home() {
  return (
    <main className='home'>

    <h1 className="text-5xl font-bold underline">
      Hello world!
    </h1>
      <h1 >Redux Counter</h1>
      <Counter />
    </main>
  );
}