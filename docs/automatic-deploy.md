# 自动测试与双端部署

`.github/workflows/deploy.yml` 在每次推送 `main` 后执行以下闭环：

1. 使用 Node 22 跑三套 headless、武器冒烟、排行榜测试和后端确定性测试。
2. 校验 `src/`、`index.html`、`style.css` 与 `deploy/` 完全同步。
3. 为同一 Git 提交生成 `deploy/deploy-manifest.json` 和后端 `DEPLOY_SHA`。
4. 将同一个发布包同步到香港 OSS、Caddy 静态目录和排行榜 API。
5. 从公网读取 OSS、Caddy 和 `/health` 的提交号；三者不一致则部署失败。

## GitHub 一次性配置

在仓库 **Settings → Secrets and variables → Actions** 中创建 `production` 环境，并设置：

- Secret `OSS_ACCESS_KEY_ID`：仅授予 `sanssurvivor` Bucket 上传与列举权限的 RAM 用户 AK。
- Secret `OSS_ACCESS_KEY_SECRET`：上述 RAM 用户的 AK Secret。
- Secret `DEPLOY_SSH_KEY`：只允许登录部署服务器的专用 SSH 私钥。
- Secret `DEPLOY_KNOWN_HOSTS`：`ssh-keyscan -H 8.217.119.0` 经过人工核对后的主机指纹。
- Variable `DEPLOY_HOST`：`8.217.119.0`。
- Variable `DEPLOY_USER`：部署用户；当前服务器使用 `root`。

不要把 AK、SSH 私钥或后台密码写进仓库。阿里云建议使用最小权限 RAM 身份，并通过环境变量向 ossutil 提供凭证。

## 手动重跑

进入 GitHub 仓库的 **Actions → Test and deploy production → Run workflow**。并发锁会等待前一次生产部署完成，避免两个提交交叉覆盖。
