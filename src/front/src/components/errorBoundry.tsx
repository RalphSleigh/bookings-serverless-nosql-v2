import React from "react";
import { serializeError } from "serialize-error";

function logError(message: any, stack:any, from="") {
    try {
        const jsonMessage = {
            message: message,
            stack: stack,
            from: from
        };

        const jsonString = JSON.stringify(jsonMessage);

        const options: RequestInit = {
            method: 'POST',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            credentials: "same-origin",
            body: jsonString
        }

        fetch('/api/error', options)
    } catch (e) {
        console.error(e)
        // ah well we tried
    }
}

export class ReactErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: any, info: any) {
        // Example "componentStack":
        //   in ComponentThatThrows (created by App)
        //   in ErrorBoundary (created by App)
        //   in div (created by App)
        //   in App
        console.log("LOGGING FROM ERROR BOUNDARY")
        logError(serializeError(error), info.componentStack, "React Error Boundary");
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <div>Oops, something went wrong, maybe <a href="/">refreshing</a> the page will help.<br /><br />It would be helpful to email <a href="mailto:ralph.sleigh@woodcraft.org.uk">ralph.sleigh@woodcraft.org.uk</a> describing what you were doing when this happened</div>
        }

        return this.props.children;
    }
}