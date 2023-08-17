const {default: axios} = require("axios");
const urlList = require("./urlList");
const fs = require('fs')
const path = require('path')

const callbackErrors = (err)=> err? console.error(err) : null

const extractionPath = path.join(__dirname, 'wsdls')

fs.rmSync(extractionPath, {force: true, recursive: true})

if(!fs.existsSync(extractionPath)){
    fs.mkdirSync(extractionPath)
}

let dataPom = `

    <!-- used in 
        build
            plugins
                plugin
                    executions
                        ...execution
                    executions
                plugin
            plugins
        build
    -->
`
let executionTimes = 1

for(let url of urlList){
    const filename = url.substring(url.lastIndexOf('/')+1).replace('?', '.')
    axios.get(url).then(response => {
        fs.writeFile(path.join(extractionPath, filename), response.data, 'utf-8', callbackErrors)
    })

    dataPom += `
        <execution>
            <id>generate-sources-${executionTimes}</id>
            <phase>generate-sources</phase>
            <configuration>
                <sourceRoot>
                    \${project.build.directory}/generated-sources/${filename.split('.')[0]}</sourceRoot>
                <wsdlOptions>
                    <wsdlOption>
                        <wsdl>
                            \${basedir}/src/main/resources/wsdls/${filename}</wsdl>
                    </wsdlOption>
                </wsdlOptions>
            </configuration>
            <goals>
                <goal>wsdl2java</goal>
            </goals>
        </execution>
    `

    executionTimes++
}

fs.writeFile(path.join(__dirname, 'pom.xml.txt'), dataPom, 'utf-8', callbackErrors)