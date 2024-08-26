import theresWaldo from "theres-waldo";
const { file, dir } = theresWaldo(import.meta.url);

console.table({ file, dir }); // Outputs the current directory
