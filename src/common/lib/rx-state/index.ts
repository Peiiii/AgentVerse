import { useEffect, useMemo, useRef, useState } from "react";
import { BehaviorSubject, distinctUntilChanged, Observable } from "rxjs";

export const useObservableFromState = <T>(value: T) => {
   
  const subject = useMemo(() => {
    return new BehaviorSubject(value);
  }, [value]);
  useEffect(() => {
    if (subject.value !== value) {
      subject.next(value);
    }
  }, [subject, value]);
  const observable = useMemo(() => {
    return subject.asObservable();
  }, [subject]);
  return observable;
};

export const useEffectFromObservable = <T>(
  observableOrGetter: Observable<T> | (() => Observable<T>),
  effect?: (value: T) => void
) => {
  const effectRef = useRef(effect);
  effectRef.current = effect;
  const [observable] = useState(() => {
    if (typeof observableOrGetter === "function") {
      return observableOrGetter();
    }
    return observableOrGetter;
  });
  useEffect(() => {
    const subscription = observable
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        effectRef.current?.(value);
      });
    return () => subscription.unsubscribe();
  }, [observable]);
};

export const useStateFromObservable = <T>(
  observableOrGetter: Observable<T> | (() => Observable<T>),
  defaultValue: T
) => {
  const [value, setValue] = useState<T>(defaultValue);
  useEffectFromObservable(observableOrGetter, (value) => {
    setValue(value);
  });
  return value;
};
