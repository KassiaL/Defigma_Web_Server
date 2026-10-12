// Vertical metrics of the fonts of a Defold project, for the Figma plugin to place texts the way the
// engine lays them out. A runtime generated font (`[font] runtime_generation = 1` in game.project)
// lines its texts up by the hhea ascender, descender and line gap of its TTF.

const path = require('path')
const fs = require('fs')

const SKIPPED_DIRECTORIES = new Set(['build', 'node_modules'])
const TTF_FIELD = /^font:\s*"([^"]+)"/m

const readRuntimeGeneration = projectPath => {
	const gameProject = path.join(projectPath, 'game.project')
	if (!fs.existsSync(gameProject)) return false
	let section = ''
	for (const rawLine of fs.readFileSync(gameProject, 'utf8').split(/\r?\n/)) {
		const line = rawLine.trim()
		const header = line.match(/^\[(.+)\]$/)
		if (header) {
			section = header[1].trim()
			continue
		}
		const entry = line.match(/^runtime_generation\s*=\s*(\S+)/)
		if (section === 'font' && entry) return entry[1] === '1'
	}
	return false
}

const findFontFiles = directory => {
	const found = []
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (entry.name.startsWith('.')) continue
		const entryPath = path.join(directory, entry.name)
		if (entry.isDirectory()) {
			if (!SKIPPED_DIRECTORIES.has(entry.name)) found.push(...findFontFiles(entryPath))
		} else if (entry.name.endsWith('.font')) {
			found.push(entryPath)
		}
	}
	return found
}

const findTable = (buffer, fontOffset, tag) => {
	const tableCount = buffer.readUInt16BE(fontOffset + 4)
	for (let index = 0; index < tableCount; index++) {
		const record = fontOffset + 12 + index * 16
		if (buffer.toString('latin1', record, record + 4) === tag) return buffer.readUInt32BE(record + 8)
	}
	throw new Error(`no '${tag}' table`)
}

const readTtfMetrics = ttfPath => {
	const buffer = fs.readFileSync(ttfPath)
	const fontOffset = buffer.toString('latin1', 0, 4) === 'ttcf' ? buffer.readUInt32BE(12) : 0
	const unitsPerEm = buffer.readUInt16BE(findTable(buffer, fontOffset, 'head') + 18)
	const hhea = findTable(buffer, fontOffset, 'hhea')
	return {
		ascent: buffer.readInt16BE(hhea + 4) / unitsPerEm,
		descent: -buffer.readInt16BE(hhea + 6) / unitsPerEm,
		line_gap: buffer.readInt16BE(hhea + 8) / unitsPerEm
	}
}

// { runtime_generation, project_path, fonts: { <font name>: metrics }, errors: { <font name>: reason } },
// keyed by the .font file name, which is the font name Defigma gives a text node.
const readProjectFontMetrics = projectPath => {
	const root = path.resolve(projectPath)
	const result = { runtime_generation: readRuntimeGeneration(root), project_path: root, fonts: {}, errors: {} }
	for (const fontPath of findFontFiles(root)) {
		const name = path.basename(fontPath, '.font')
		const relativeFont = '/' + path.relative(root, fontPath).split(path.sep).join('/')
		const ttf = fs.readFileSync(fontPath, 'utf8').match(TTF_FIELD)
		if (!ttf) {
			result.errors[name] = `${relativeFont} names no TTF in its 'font' field`
			continue
		}
		try {
			result.fonts[name] = readTtfMetrics(path.join(root, ttf[1]))
		} catch (error) {
			result.errors[name] = `${relativeFont}: cannot read the metrics of ${ttf[1]} (${error.message})`
		}
	}
	return result
}

module.exports = { readProjectFontMetrics }
