import http from "http";
import app from "./App";
import { logInfo } from "./utils/logger";
import { PORT } from "./utils/config";

const server = http.createServer(app);

server.listen(PORT, () => {
  logInfo(`Server running on port ${PORT}`);
});
