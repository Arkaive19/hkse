# Hollow Knight Save Editor

A CLI tool to encrypt and decrypt Hollow Knight save files. This Project was Inspired by [@Bloodorca's](https://github.com/Bloodorca) [hollow](https://github.com/bloodorca/hollow) project.

## Installation

```bash
npm install -g hkse
```

## Usage

```bash
hkse <file> <d|e> <output|"self">
```

- `<file>`: The path to the file to encrypt or decrypt.
- `<d|e>`: The action to perform. `d` for decrypt, `e` for encrypt.
- `<output|"self">`: The path to the output file. If `self` is specified, the output file will be in the same directory as the input file with the same name. If a path is specified, the output file must be specified, i.e your output path must not end in a directory and must be a .json (for decrypt) or .dat (for encrypt) file

## Example

```bash
hkse ./home/desktop/save.dat d self
hkse ./home/desktop/save.dat d ./home/desktop/custom/save.json
hkse ./home/desktop/custom/save.json e self
hkse ./home/desktop/custom/save.json e ./home/desktop/save.dat
```

### Notes

- The input file must be a .dat (for encrypt) or .json (for decrypt) file
- The output file must be a .json (for decrypt) or .dat (for encrypt) file
- The output file must not end in a directory
- The output file must not be the same as the input file
- In case of any errors you can contact me in [Discord](https://discord.gg/Arkaive19) or [GitHub](https://github.com/Arkaive19)# hkse

# hkse
