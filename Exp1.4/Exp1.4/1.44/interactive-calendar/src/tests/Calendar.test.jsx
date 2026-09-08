/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import postsReducer, { reschedulePost } from '../store/postSlice';
import App from '../App';

function makeStore() {
  return configureStore({ reducer: { posts: postsReducer } });
}

function renderApp() {
  const store = makeStore();
  const utils = render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
  return { store, ...utils };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('Interactive Calendar', () => {
  it('1. Calendar renders without crash', () => {
    renderApp();
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('2. Sample posts appear on load as draggable chips', () => {
    renderApp();
    expect(screen.getByTestId('draggable-post-p1')).toBeInTheDocument();
    expect(screen.getByTestId('draggable-post-p2')).toBeInTheDocument();
    expect(screen.getByTestId('draggable-post-p3')).toBeInTheDocument();
    expect(screen.getByTestId('draggable-post-p4')).toBeInTheDocument();
    expect(screen.getByTestId('draggable-post-p5')).toBeInTheDocument();
  });

  it('3. PostForm renders all fields', () => {
    renderApp();
    const form = screen.getByTestId('post-form');
    expect(within(form).getByTestId('field-title')).toBeInTheDocument();
    expect(within(form).getByTestId('field-description')).toBeInTheDocument();
    expect(within(form).getByTestId('field-platform')).toBeInTheDocument();
    expect(within(form).getByTestId('field-date')).toBeInTheDocument();
    expect(within(form).getByTestId('field-time')).toBeInTheDocument();
    expect(within(form).getByTestId('field-status')).toBeInTheDocument();
    expect(within(form).getByTestId('field-priority')).toBeInTheDocument();
    expect(within(form).getByTestId('field-author')).toBeInTheDocument();
  });

  it('4. Adding a post works', () => {
    const { store } = renderApp();
    const form = screen.getByTestId('post-form');
    fireEvent.change(within(form).getByTestId('field-title'), {
      target: { value: 'New Post' },
    });
    fireEvent.change(within(form).getByTestId('field-date'), {
      target: { value: '2026-08-20' },
    });
    fireEvent.click(screen.getByTestId('submit-button'));

    const state = store.getState();
    expect(state.posts.posts.some((p) => p.title === 'New Post')).toBe(true);
  });

  it('5. Deleting a post works', () => {
    const { store } = renderApp();
    const before = store.getState().posts.posts.length;
    fireEvent.click(screen.getByTestId('delete-p3'));
    const after = store.getState().posts.posts.length;
    expect(after).toBe(before - 1);
    expect(store.getState().posts.posts.some((p) => p.id === 'p3')).toBe(false);
  });

  it('6. Each optimization toggle switches its own state', () => {
    renderApp();
    expect(screen.getByTestId('memo-toggle')).toHaveTextContent('ON');
    expect(screen.getByTestId('usememo-toggle')).toHaveTextContent('ON');
    expect(screen.getByTestId('usecallback-toggle')).toHaveTextContent('ON');
    expect(screen.getByTestId('memo-status')).toHaveTextContent('Active');
    expect(screen.getByTestId('usememo-status')).toHaveTextContent('Active');
    expect(screen.getByTestId('usecallback-status')).toHaveTextContent('Active');

    fireEvent.click(screen.getByTestId('memo-toggle'));
    expect(screen.getByTestId('memo-toggle')).toHaveTextContent('OFF');
    expect(screen.getByTestId('memo-status')).toHaveTextContent('Inactive');
    expect(screen.getByTestId('usememo-toggle')).toHaveTextContent('ON');
    expect(screen.getByTestId('usecallback-toggle')).toHaveTextContent('ON');

    fireEvent.click(screen.getByTestId('usememo-toggle'));
    expect(screen.getByTestId('usememo-toggle')).toHaveTextContent('OFF');
    expect(screen.getByTestId('usememo-status')).toHaveTextContent('Inactive');

    fireEvent.click(screen.getByTestId('usecallback-toggle'));
    expect(screen.getByTestId('usecallback-toggle')).toHaveTextContent('OFF');
    expect(screen.getByTestId('usecallback-status')).toHaveTextContent('Inactive');
  });

  it('7. Master optimization toggle switches all optimizations', () => {
    renderApp();
    const masterToggle = screen.getByTestId('optimizations-toggle');

    expect(masterToggle).toHaveTextContent('ON');
    fireEvent.click(masterToggle);

    expect(masterToggle).toHaveTextContent('OFF');
    expect(screen.getByTestId('memo-toggle')).toHaveTextContent('OFF');
    expect(screen.getByTestId('usememo-toggle')).toHaveTextContent('OFF');
    expect(screen.getByTestId('usecallback-toggle')).toHaveTextContent('OFF');
    expect(screen.getByTestId('memo-status')).toHaveTextContent('Inactive');
    expect(screen.getByTestId('usememo-status')).toHaveTextContent('Inactive');
    expect(screen.getByTestId('usecallback-status')).toHaveTextContent('Inactive');

    fireEvent.click(masterToggle);
    expect(masterToggle).toHaveTextContent('ON');
    expect(screen.getByTestId('memo-toggle')).toHaveTextContent('ON');
    expect(screen.getByTestId('usememo-toggle')).toHaveTextContent('ON');
    expect(screen.getByTestId('usecallback-toggle')).toHaveTextContent('ON');
  });

  it('8. RenderCounter increments on re-render', () => {
    renderApp();
    const initial = screen.getByTestId('render-count-app').textContent;
    fireEvent.click(screen.getByTestId('memo-toggle'));
    const after = screen.getByTestId('render-count-app').textContent;
    expect(Number(after)).toBeGreaterThan(Number(initial));
  });

  it('9. reschedulePost action updates date in Redux state', () => {
    const store = makeStore();
    expect(store.getState().posts.posts[0].date).toBeTruthy();
    store.dispatch(reschedulePost({ id: 'p1', date: '2026-08-25' }));
    const p1 = store.getState().posts.posts.find((p) => p.id === 'p1');
    expect(p1.date).toBe('2026-08-25');
  });

  it('10. HTML5 drag-and-drop reschedules a post via onDrop', () => {
    const { store } = renderApp();
    const originalDate = store.getState().posts.posts.find((p) => p.id === 'p1').date;

    // Find a day cell that is NOT the original date.
    const today = new Date();
    const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10);
    const ymd = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    const targetCell = screen.getByTestId(`day-cell-${ymd}`);
    expect(targetCell).toBeInTheDocument();

    // Simulate native HTML5 drag-and-drop: dragstart on the post chip, then
    // drop on the target day cell. dataTransfer is supplied manually because
    // jsdom does not implement it.
    const post = screen.getByTestId('draggable-post-p1');
    const dataTransfer = {
      data: {},
      setData(type, value) { this.data[type] = value; },
      getData(type) { return this.data[type] || ''; },
      effectAllowed: '',
      dropEffect: '',
    };
    fireEvent.dragStart(post, { dataTransfer });
    fireEvent.drop(targetCell, { dataTransfer });

    const p1 = store.getState().posts.posts.find((p) => p.id === 'p1');
    expect(p1.date).toBe(ymd);
    expect(p1.date).not.toBe(originalDate);
  });

  it('11. Reset clears counts and dragover does not count as a render', () => {
    const { store } = renderApp();
    const today = new Date();
    const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10);
    const ymd = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    const targetCell = screen.getByTestId(`day-cell-${ymd}`);
    const post = screen.getByTestId('draggable-post-p1');

    fireEvent.click(screen.getByTestId('reset-counts'));
    expect(screen.getByTestId('render-count-app')).toHaveTextContent('0');
    expect(screen.getByTestId('render-count-calendar')).toHaveTextContent('0');
    expect(screen.getByTestId('render-count-postcard')).toHaveTextContent('0');

    fireEvent.dragOver(targetCell);
    expect(screen.getByTestId('render-count-app')).toHaveTextContent('0');
    expect(screen.getByTestId('render-count-calendar')).toHaveTextContent('0');

    const dataTransfer = {
      data: {},
      setData(type, value) { this.data[type] = value; },
      getData(type) { return this.data[type] || ''; },
      effectAllowed: '',
      dropEffect: '',
    };
    fireEvent.dragStart(post, { dataTransfer });
    fireEvent.drop(targetCell, { dataTransfer });

    expect(screen.getByTestId('render-count-app')).toHaveTextContent('1');
    expect(screen.getByTestId('render-count-calendar')).toHaveTextContent('1');
    expect(store.getState().posts.posts.find((item) => item.id === 'p1').date).toBe(ymd);
  });

  it('12. Optimizations reduce PostCard renders during an unrelated drag', () => {
    const { store } = renderApp();
    const today = new Date();
    const optimizedTarget = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10);
    const optimizedDate = `${optimizedTarget.getFullYear()}-${String(optimizedTarget.getMonth() + 1).padStart(2, '0')}-${String(optimizedTarget.getDate()).padStart(2, '0')}`;
    const optimizedCell = screen.getByTestId(`day-cell-${optimizedDate}`);
    const drag = (targetCell) => {
      const post = screen.getByTestId('draggable-post-p2');
      const dataTransfer = {
        data: {},
        setData(type, value) { this.data[type] = value; },
        getData(type) { return this.data[type] || ''; },
        effectAllowed: '',
        dropEffect: '',
      };
      fireEvent.dragStart(post, { dataTransfer });
      fireEvent.drop(targetCell, { dataTransfer });
    };

    fireEvent.click(screen.getByTestId('reset-counts'));
    fireEvent.dragOver(optimizedCell);
    fireEvent.dragOver(optimizedCell);
    expect(screen.getByTestId('render-count-app')).toHaveTextContent('0');
    expect(screen.getByTestId('render-count-calendar')).toHaveTextContent('0');
    expect(screen.getByTestId('render-count-postcard')).toHaveTextContent('0');
    drag(optimizedCell);
    expect(screen.getByTestId('render-count-app')).toHaveTextContent('1');
    expect(screen.getByTestId('render-count-calendar')).toHaveTextContent('1');
    expect(screen.getByTestId('render-count-postcard')).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('optimizations-toggle'));
    fireEvent.click(screen.getByTestId('reset-counts'));
    const unoptimizedTarget = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 11);
    const unoptimizedDate = `${unoptimizedTarget.getFullYear()}-${String(unoptimizedTarget.getMonth() + 1).padStart(2, '0')}-${String(unoptimizedTarget.getDate()).padStart(2, '0')}`;
    const unoptimizedCell = screen.getByTestId(`day-cell-${unoptimizedDate}`);
    fireEvent.dragOver(unoptimizedCell);
    fireEvent.dragOver(unoptimizedCell);
    expect(screen.getByTestId('render-count-app')).toHaveTextContent('0');
    expect(screen.getByTestId('render-count-calendar')).toHaveTextContent('0');
    drag(unoptimizedCell);

    expect(screen.getByTestId('render-count-app')).toHaveTextContent('1');
    expect(screen.getByTestId('render-count-calendar')).toHaveTextContent('1');
    expect(screen.getByTestId('render-count-postcard')).toHaveTextContent('1');
    expect(store.getState().posts.posts.find((item) => item.id === 'p2').date).toBe(unoptimizedDate);
  });
});
