import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_user/event/$eventId')({
  component: Outlet,
})
