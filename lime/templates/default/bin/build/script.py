#!/usr/bin/env python

import subprocess

def main():
	call = 'python {limejs_directory}/bin/lime.py '
	call += 'build {name} '
	call += '--use-strict '
	call += '--output_file="../compiled/script/{name}.js" '
	call += '--output_mode="script" '

	subprocess.call(call,shell=True)
if __name__ == '__main__':
	main()
