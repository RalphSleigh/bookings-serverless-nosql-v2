import { Center, Loader } from "@mantine/core";
import React from "react";

export const SuspenseLoader: React.FC<React.PropsWithChildren> = ({children}) => {
    return <Center h={"100vh"}>
        <img src="/newspinner.svg" alt="Logo" width="100px"/>
    </Center>
}

export const SuspenseWrapper: React.FC<React.PropsWithChildren> = ({children}) => {
    return <React.Suspense fallback={<SuspenseLoader/>}>
        {children}
    </React.Suspense>
}

export const SmallSuspenseLoader: React.FC<React.PropsWithChildren> = ({children}) => {
    return <Center>
        <img src="/newspinner.svg" alt="Logo" width="100px"/>
    </Center>
}

export const SmallSuspenseWrapper: React.FC<React.PropsWithChildren> = ({children}) => {
    return <React.Suspense fallback={<SmallSuspenseLoader/>}>
        {children}
    </React.Suspense>
}
