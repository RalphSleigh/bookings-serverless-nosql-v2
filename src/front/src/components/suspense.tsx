import { Center, Loader } from "@mantine/core";
import React from "react";

export const SuspenseWrapper: React.FC<React.PropsWithChildren> = ({children}) => {
    return <Center h={"100vh"}>
        <img src="/newspinner.svg" alt="Logo" width="100px"/>
    </Center>
}
