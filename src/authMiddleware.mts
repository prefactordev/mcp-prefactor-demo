import { Request, Response, NextFunction } from "express";
import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import * as OpenIDClient from "openid-client";

interface AuthMiddlewareOptions {
  mcpPath: string;
  authIssuer: string;
  authClientId: string;
  authClientSecret: string;
}

interface RequestWithAuth extends Request {
  auth?: AuthInfo;
}

function getFullUrl(req: Request) {
  return `${req.protocol}://${req.host}${req.url}`;
}

function replacePath(req: Request, path: string) {
  const urlObj = new URL(getFullUrl(req));
  urlObj.pathname = path;
  return urlObj.toString();
}

function addWellKnownPrefix(url: string, name: string) {
  const urlObj = new URL(url);
  urlObj.pathname = `/.well-known/${name}${urlObj.pathname}`;
  return urlObj.toString();
}

async function validateToken(token: string | undefined, resource: URL, options: AuthMiddlewareOptions) {
  if (!token) {
    return;
  }

  const config = await OpenIDClient.discovery(new URL(options.authIssuer), options.authClientId, options.authClientSecret);
  const tokenInfo = await OpenIDClient.tokenIntrospection(config, token);

  if (!tokenInfo.active) {
    return;
  }

  return {
    token,
    clientId: tokenInfo.client_id as string,
    scopes: ((tokenInfo.scope ?? "") as string).split(" "),
    expiresAt: tokenInfo.exp,
    resource,
    extra: {
      sub: tokenInfo.sub
    }
  }
}

function send401(req: Request, res: Response) {
  res
    .status(401)
    .header("WWW-Authenticate", `Bearer resource_metadata=${addWellKnownPrefix(getFullUrl(req), "oauth-protected-resource")}`)
    .send("Unauthorized");
}

export function authMiddleware(options: AuthMiddlewareOptions) {
  async function handleMcpRequest(req: RequestWithAuth, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return send401(req, res);
    }

    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    req.auth = await validateToken(match?.[1], new URL(getFullUrl(req)), options);

    if (!req.auth) {
      return send401(req, res);
    }

    return next();
  }

  function handleResourceMetadataRequest(req: Request, res: Response, _next: NextFunction) {
    res.json({
      resource: replacePath(req, options.mcpPath),
      authorization_servers: [
        options.authIssuer
      ]
    })
  }

  return (req: RequestWithAuth, res: Response, next: NextFunction) => {
    if (req.url === options.mcpPath) {
      handleMcpRequest(req, res, next);
    } else if (req.url === `/.well-known/oauth-protected-resource${options.mcpPath}`) {
      handleResourceMetadataRequest(req, res, next);
    } else {
      next();
    }
  };
}
