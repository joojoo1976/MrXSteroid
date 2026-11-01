import React from 'react';
import { act } from 'react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useReadinessQuiz } from '@/features/calculator/hooks/useReadinessQuiz';
import { arContent, enContent } from '@/i18n';
import type { ContentStrings } from '@/shared/types/types';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface HarnessProps {
  content: ContentStrings;
  marker?: string;
}

function Harness({ content, marker = '' }: HarnessProps) {
  const { sessionQuestions, totalQuestions } = useReadinessQuiz({ content });
  return (
    <div data-marker={marker} data-total={totalQuestions}>
      {sessionQuestions.map((question) => (
        <section key={question.question}>
          <h3>{question.question}</h3>
          {question.options.map((option) => <button key={option.text}>{option.text}</button>)}
        </section>
      ))}
    </div>
  );
}

const mountedRoots: Root[] = [];
const mountedContainers: HTMLElement[] = [];

function mountContainer(html = ''): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  mountedContainers.push(container);
  return container;
}

function seededRandom(values: number[]) {
  let index = 0;
  return vi.spyOn(Math, 'random').mockImplementation(() => values[index++] ?? values.at(-1) ?? 0);
}

afterEach(async () => {
  await act(async () => {
    while (mountedRoots.length > 0) mountedRoots.pop()?.unmount();
  });
  while (mountedContainers.length > 0) mountedContainers.pop()?.remove();
  vi.restoreAllMocks();
});

describe.each([
  ['English', enContent],
  ['Arabic', arContent],
] as const)('useReadinessQuiz hydration (%s)', (_label, content) => {
  it('uses the same deterministic questions for SSR and the first client render', () => {
    const random = vi.spyOn(Math, 'random');
    const serverHtml = renderToString(<Harness content={content} />);
    const serverContainer = document.createElement('div');
    serverContainer.innerHTML = serverHtml;
    const firstQuestions = content.quiz.questions.slice(0, 5);

    expect(random).not.toHaveBeenCalled();
    expect(Array.from(serverContainer.querySelectorAll('h3'), (node) => node.textContent)).toEqual(
      firstQuestions.map((question) => question.question),
    );
    expect(Array.from(serverContainer.querySelectorAll('button'), (node) => node.textContent)).toEqual(
      firstQuestions.flatMap((question) => question.options.map((option) => option.text)),
    );
  });

  it('hydrates without console errors, then randomizes once after hydration', async () => {
    const serverHtml = renderToString(<Harness content={content} />);
    const container = mountContainer(serverHtml);
    const firstServerQuestion = content.quiz.questions[0].question;
    const random = seededRandom(Array(content.quiz.questions.length).fill(0));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(container.querySelector('h3')?.textContent).toBe(firstServerQuestion);

    let root!: Root;
    await act(async () => {
      root = hydrateRoot(container, <Harness content={content} />);
    });
    mountedRoots.push(root);

    expect(random).toHaveBeenCalledTimes(content.quiz.questions.length - 1);
    const expectedShuffledQuestions = content.quiz.questions.slice(1, 6);
    expect(Array.from(container.querySelectorAll('h3'), (node) => node.textContent)).toEqual(
      expectedShuffledQuestions.map((question) => question.question),
    );
    expect(container.querySelectorAll('section')).toHaveLength(5);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('keeps the randomized session stable during re-renders and in-place language changes', async () => {
    const container = mountContainer();
    const root = createRoot(container);
    mountedRoots.push(root);
    const random = seededRandom(Array(content.quiz.questions.length).fill(0));

    await act(async () => {
      root.render(<Harness content={content} marker="first" />);
    });
    const questionsAfterInitialization = Array.from(container.querySelectorAll('h3'), (node) => node.textContent);
    const callsAfterInitialization = random.mock.calls.length;

    const alternateContent = content === enContent ? arContent : enContent;
    await act(async () => {
      root.render(<Harness content={alternateContent} marker="second" />);
    });

    expect(Array.from(container.querySelectorAll('h3'), (node) => node.textContent)).toEqual(questionsAfterInitialization);
    expect(random).toHaveBeenCalledTimes(callsAfterInitialization);
    expect(container.firstElementChild).toHaveAttribute('data-marker', 'second');
  });
});
