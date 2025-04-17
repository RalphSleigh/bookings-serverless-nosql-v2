import { Button, ButtonProps, Link, SelectChangeEvent } from '@mui/material';
import { createLink, LinkComponent } from '@tanstack/react-router';
import { parseISO } from 'date-fns';
import React, { Dispatch, SetStateAction } from 'react';

export function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(() => {
    const stickyValue = window.localStorage && window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  React.useEffect(() => {
    if (window.localStorage) window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

export const MUILink = createLink(Link);

interface MUIButtonLinkProps extends ButtonProps<'a'> {
  // Add any additional props you want to pass to the Button
}

const MUIButtonLinkComponent = React.forwardRef<HTMLAnchorElement, MUIButtonLinkProps>((props, ref) => <Button ref={ref} component="a" {...props} />);

const CreatedButtonLinkComponent = createLink(MUIButtonLinkComponent);

export const MUIButtonLink: LinkComponent<typeof MUIButtonLinkComponent> = (props) => {
  return <CreatedButtonLinkComponent preload={'intent'} {...props} />;
};

export function getSubUpdate<
  T extends Record<string, any>,
  K extends keyof T &
    {
      [K in keyof Required<T>]: Required<T>[K] extends Record<string, any> ? K : never;
    }[keyof Required<T>],
>(update: Dispatch<SetStateAction<T>>, key: K): Dispatch<SetStateAction<Required<T>[K]>> {
  console.log("UseMemo", key);
  return React.useMemo(
    () => (valueOrUpdater) => {
    update((prevData) => {
      const newValue = typeof valueOrUpdater === 'function' ? (valueOrUpdater as CallableFunction)(prevData[key] || ({} as Required<T>[K])) : valueOrUpdater;
      return {
        ...prevData,
        [key]: newValue,
      };
    });
  }, [])
}

export function getArrayUpdate<T extends Record<string, any>, K extends keyof T & { [K in keyof Required<T>]: Required<T>[K] extends Array<any> ? K : never }[keyof Required<T>]>(
  update: Dispatch<SetStateAction<T>>,
  key: K,
): Dispatch<SetStateAction<undefined extends T[K] ? Required<T>[K] | undefined : Required<T>[K]>> {
  console.log("UseMemo", key);
  return React.useMemo(
  () => (valueOrUpdater) => {
    update((prevData) => {
      const newValue = typeof valueOrUpdater === 'function' ? (valueOrUpdater as CallableFunction)(prevData[key] || ([] as Required<T>[K])) : valueOrUpdater;
      return {
        ...prevData,
        [key]: newValue,
      };
    });
  }, [])
}

export function getMemoObjectUpdateFunctions<T extends {}, F extends keyof T>(update: Dispatch<SetStateAction<T>>) {
  console.log("UseMemoObject");
  return React.useMemo(
    () => ({
      updateField: (field: F) => (e: { target: { value: string }; preventDefault: () => void }) => {
        update((data) => {
          return { ...data, [field]: e.target.value };
        });
        e.preventDefault();
      },
      updateDate: (field: F) => (e: string | Date | null) => {
        const value = e instanceof Date ? e.toISOString() : e;
        update((data) => ({ ...data, [field]: value }));
      },
      updateSwitch: (field: F) => (e: React.ChangeEvent<HTMLInputElement>) => {
        update((data) => ({ ...data, [field]: e.target.checked }));
      },
      updateNumber: (field: F) => (e: React.ChangeEvent<HTMLInputElement>) => {
        update((data) => ({ ...data, [field]: parseInt(e.target.value) }));
        e.preventDefault();
      },
    }),
    [],
  );
}

export function getMemoArrayUpdateFunctions<T extends Array<any>>(update: Dispatch<SetStateAction<T | undefined>>) {
  console.log("UseMemoArray");
  return React.useMemo(
    () => ({
      updateItem: (index: number): Dispatch<SetStateAction<T[number]>> => {
        return (valueOrUpdater) => {
          update((prevData) => {
            prevData = prevData || ([] as unknown as T);
            const newValue = typeof valueOrUpdater === 'function' ? (valueOrUpdater as CallableFunction)(prevData[index] || ({} as T[number])) : valueOrUpdater;
            const newData = [...prevData];
            newData[index] = newValue;
            return newData as T;
          });
        };
      },

      deleteItem: (index: number) => {
        update((prevData) => {
          prevData = prevData || ([] as unknown as T);
          const newData = [...prevData];
          newData.splice(index, 1);
          return newData as T;
        });
      },
    }),
    [],
  );
}

export function toLocalDate(date: string): Date | null {
  let localDate = parseISO(date)
  if (!localDate) return null

  return new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000)
}