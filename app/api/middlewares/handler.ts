export type NextCustomMiddlewareType = (
    req: Request,
    context: { params?: { [key: string]: string } },
    options?: { next?: () => void; prevResult?: any }
) => Promise<any | Response>;

export const middleware =
    (...middlewares: NextCustomMiddlewareType[]) =>
        async (req: Request, context: { params?: { [key: string]: string } } = {}) => {
            let result;

            for (let i = 0; i < middlewares.length; i++) {
                let nextInvoked = false;

                const next = () => {
                    nextInvoked = true;
                };

                result = await middlewares[i](req, context, { next, prevResult: result });

                if (!nextInvoked) {
                    break;
                }
            }

            return result;
        };
