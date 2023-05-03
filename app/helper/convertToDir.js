import { pathToFileURL } from "url"
const urltoDir = (dir) => {
    const check = `F:\nodeProject\app\lib\graphql`

    // check.split(":");
    console.log(pathToFileURL(check))
}
urltoDir()
// export default urltoDir;