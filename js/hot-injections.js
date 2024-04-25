const fs = require('fs');
const path = require('path');

const VirtualModuleId = "virtual:injected-templates";
const VirtualModuleResolver = `/${VirtualModuleId}`;

function InjectHtml(options = {}) {
    const { ignored_tags = [], templates_dir = "templates" } = options;

    const transformHtmlContent = (htmlContent) => {
        return htmlContent.replace(/\{%(\w+)%\}/g, (match, filename) => {
            if(ignored_tags.includes(filename)) {
                return match;
            }

            const templatePath = path.resolve(
                process.cwd(),
                templates_dir,
                `${filename}.html`
            );

            if(fs.existsSync(templatePath)) {
                return fs.readFileSync(templatePath, "utf-8");
            } else {
                console.error(`Template file not found: ${templatePath}`);
                return match;
            }
        });
    };

    return {
        name: "inject-html",

        resolveId(id) {
            if(id === VirtualModuleResolver) {
                return VirtualModuleResolver;
            }
        },

        load(id) {
            if(id === VirtualModuleResolver) {
                return "/* virtual module for HTML templates */";
            }
        },

        handleHotUpdate({ file, server }) {
            if(file.startsWith(path.resolve(process.cwd(), templates_dir))) {
                server.ws.send({
                    type: "full-reload",
                    path: "*", // Reload all paths
                });
            }
        },

        configureServer(server) {
            server.middlewares.use((request, response, next) => {
                let accumulatedBody = Buffer.from("");
                const originalWrite = response.write.bind(response);
                const originalEnd = response.end.bind(response);

                response.write = function (chunk, ...args) {
                    accumulatedBody = Buffer.concat([
                        accumulatedBody,
                        Buffer.from(chunk),
                    ]);
                    return originalWrite.apply(chunk, args);
                };

                response.end = function (chunk, ...args) {
                    if(chunk) {
                        accumulatedBody = Buffer.concat([
                            accumulatedBody,
                            Buffer.from(chunk),
                        ]);
                    }

                    if(response.getHeader("Content-Type")?.includes("text/html") && accumulatedBody) {
                        const transformedHtml = transformHtmlContent(accumulatedBody.toString());
                        const timestampHtml = `${transformedHtml}\n<!-- Cache-bust: ${Date.now()} -->`;
                        return originalEnd(timestampHtml, ...args);
                    }else{
                        return originalEnd(chunk, ...args);
                    }
                };

                next();
            })
        }
    }
}

module.exports = InjectHtml;