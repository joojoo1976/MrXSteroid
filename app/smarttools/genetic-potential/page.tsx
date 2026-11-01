'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { calculateGeneticPotentialV6 } from '@/lib/tools/engines/genetic-potential.v6';
import NextBestActionCard from '@/components/shared/NextBestActionCard';

export default function GeneticPotentialPage() {
  const router = useRouter();
  const [age, setAge] = useState(30);
  const [trainingYears, setTrainingYears] = useState(5);
  const [priorCycles, setPriorCycles] = useState(0);
  const [bodyType, setBodyType] = useState<'ectomorph'|'mesomorph'|'endomorph'>('mesomorph');
  const [goal, setGoal] = useState<'bulk'|'cut'|'recomp'>('bulk');
  const [weight, setWeight] = useState(80);
  const [height, setHeight] = useState(180);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState('');

  const run = () => {
    try {
      const r = calculateGeneticPotentialV6({ age, trainingYears, priorCycles, familyHistory: 'none', bodyType, goal, currentWeightKg: weight, heightCm: height });
      setResult(r);
      setErr('');
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Genetic Potential</h1>
      <label>Age <input type="number" value={age} onChange={e=>setAge(+e.target.value)} /></label>
      <label>Training years <input type="number" value={trainingYears} onChange={e=>setTrainingYears(+e.target.value)} /></label>
      <label>Prior cycles <input type="number" value={priorCycles} onChange={e=>setPriorCycles(+e.target.value)} /></label>
      <label>Body type
        <select value={bodyType} onChange={e=>setBodyType(e.target.value as any)}>
          <option value="ectomorph">ectomorph</option>
          <option value="mesomorph">mesomorph</option>
          <option value="endomorph">endomorph</option>
        </select>
      </label>
      <label>Goal
        <select value={goal} onChange={e=>setGoal(e.target.value as any)}>
          <option value="bulk">bulk</option>
          <option value="cut">cut</option>
          <option value="recomp">recomp</option>
        </select>
      </label>
      <label>Weight kg <input type="number" value={weight} onChange={e=>setWeight(+e.target.value)} /></label>
      <label>Height cm <input type="number" value={height} onChange={e=>setHeight(+e.target.value)} /></label>
      <button onClick={run}>Calculate</button>
      {err && <div data-testid="error">{err}</div>}
      {result && (
        <div data-testid="result">
          <div>Score: {result.potentialScore}</div>
          <div>BMI: {result.bmi}</div>
          <div data-testid="viz-bar" style={{width: result.potentialScore + '%'}} />
        </div>
      )}
      <NextBestActionCard action="View body fat" onAction={() => router.push('/smarttools/body-composition/body-fat')} />
    </div>
  );
}