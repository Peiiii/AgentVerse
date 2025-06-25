import { useMemoizedFn } from "ahooks";
import { useEffect, useMemo, useState } from "react";
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  identity,
} from "rxjs";

export function useObservableState<T>(
  initialValueOrGetter: T | (() => T),
  options: {
    debounceTime?: number;
  } = {}
) {
  const [state, setState] = useState<T>(initialValueOrGetter);
  const [subject] = useState(() => new BehaviorSubject<T>(state));

  useEffect(() => {
    const subscription = subject
      .pipe(
        distinctUntilChanged(),
        options.debounceTime ? debounceTime(options.debounceTime) : identity
      )
      .subscribe(setState);
    return () => subscription.unsubscribe();
  }, [options.debounceTime, subject]);

  const setValue = useMemoizedFn((value: T) => {
    subject.next(value);
  });

  const getValue = useMemoizedFn(() => {
    return subject.getValue();
  });

  const observable = useMemo(() => {
    return subject.pipe(
      distinctUntilChanged(),
      options.debounceTime ? debounceTime(options.debounceTime) : identity
    );
  }, [options.debounceTime, subject]);

  return [state, setValue, getValue, observable] as const;
}
