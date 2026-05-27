import { readFileSync } from 'fs';
import { createContext, runInContext } from 'vm';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const code = readFileSync(join(__dirname, '../../data.js'), 'utf-8');

// const/let declarations are block-scoped inside vm scripts and don't become
// properties of the sandbox object. We append explicit export assignments so
// the values can be retrieved from the shared __exports__ reference.
const sandbox = { __exports__: {} };
const wrapped = `
${code}
__exports__.LiturgicalCalendar = LiturgicalCalendar;
__exports__.CHURCH_DATA = CHURCH_DATA;
`;
runInContext(wrapped, createContext(sandbox));

export const LiturgicalCalendar = sandbox.__exports__.LiturgicalCalendar;
export const CHURCH_DATA = sandbox.__exports__.CHURCH_DATA;
