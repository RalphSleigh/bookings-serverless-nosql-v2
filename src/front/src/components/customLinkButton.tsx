import { Button, ButtonProps } from "@mantine/core"
import { createLink, LinkComponent } from "@tanstack/react-router"
import React from "react"

interface MantineButtonProps extends Omit<ButtonProps, 'href'> {
  // Add any additional props you want to pass to the anchor
}

const MantineButtonComponent = React.forwardRef<
  HTMLAnchorElement,
  MantineButtonProps
>((props, ref) => {
  return <Button component="a" ref={ref} {...props} />
})

const CreatedLinkComponent = createLink(MantineButtonComponent)

export const CustomButtonLink: LinkComponent<typeof MantineButtonComponent> = (
  props,
) => {
  return <CreatedLinkComponent preload="intent" {...props} />
}