import { readFileSync } from 'node:fs'
import { rootNodeFromAnchor } from '@codama/nodes-from-anchor'
import { createFromRoot } from 'codama'
import { renderVisitor } from '@codama/renderers-js'

const anchorIdl = JSON.parse(readFileSync(new URL('../idl/voting.json', import.meta.url), 'utf8'))
const codama = createFromRoot(rootNodeFromAnchor(anchorIdl))

await codama.accept(
  renderVisitor('.', {
    generatedFolder: 'src/generated',
    syncPackageJson: false,
    formatCode: true,
  }),
)
