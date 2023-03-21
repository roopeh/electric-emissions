import http from "http";
import app from "./App";
import { logInfo } from "./utils/logger";
import { PORT } from "./utils/config";

const server = http.createServer(app);

const serverPort = process.env.PORT || PORT;
server.listen(serverPort, () => {
  logInfo(`Server running on port ${serverPort}`);
});
