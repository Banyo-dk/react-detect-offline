import "@testing-library/jest-dom"
import { act, render, screen, waitFor } from "@testing-library/react"
import { newMockXhr } from "mock-xmlhttprequest"
import { Detector } from "./index"

describe("Detector", () => {

    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.resetModules()
        jest.clearAllMocks()
        jest.useRealTimers()
    })


    it("should render 'Online' when online", async () => {
        render(
            <Detector
                config={{ enabled: true, interval: 500, timeout: 500 }}
                render={({ online }) => <div>{online ? "Online" : "Offline"}</div>}
            />
        )

        const text = await screen.findByText("Online")
        expect(text).toBeInTheDocument()
    })

    it("should transition from 'Online' to 'Offline'", async () => {

        const MockXhr = newMockXhr();

        MockXhr.onSend = (request) => {
            const responseHeaders = { 'Content-Type': 'application/json' };
            request.respond(200, responseHeaders);

        };

        global.XMLHttpRequest = MockXhr;

        let pollAttempts = 0

        render(
            <Detector
                config={{ enabled: true, interval: 500, timeout: 500 }}
                render={({ online }) => <div>{online ? "Online" : "Offline"}</div>}
                onPoll={() => {
                    pollAttempts++
                }}
            />
        )

        // Initially online
        let text = await screen.findByText("Online")
        console.log({
            innerHTML:text.innerHTML,
            pollAttempts
        });
        expect(text).toBeInTheDocument()

        act(() => {
            jest.advanceTimersByTime(500)
        })

        await waitFor(() => {
            expect(pollAttempts).toBeGreaterThan(0)
        })

        act(() => {
            MockXhr.onSend = (request) => {
                /**
                 * We return nothing here to simulate a network error
                 */
            };
        })

        act(() => {
            jest.advanceTimersByTime(500)
        })

        // Ensure all promises resolve
        await waitFor(() => {
            text = screen.getByText("Offline")
            console.log({
                innerHTML:text.innerHTML,
                pollAttempts
            });
            
            expect(text).toBeInTheDocument()
        })

        // Verify that another poll has happened
        expect(pollAttempts).toBeGreaterThan(1)
    })
})
