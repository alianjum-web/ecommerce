import Counter from '../features/counter/Counter.js';
import "./globals.css";

export default function Home() {
  return (
    <main className='home'>
      <h1 >Redux Counter</h1>
      <Counter />
    </main>
  );
}
