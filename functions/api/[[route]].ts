import { handleApiRequest, CloudflareEnv } from '../../worker';

export const onRequest = async (context: {
  request: Request;
  env: CloudflareEnv;
}): Promise<Response> => {
  return handleApiRequest(context.request, context.env);
};
