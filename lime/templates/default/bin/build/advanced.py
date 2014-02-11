#!/usr/bin/env python

import subprocess

def main():
	call = 'python {limejs_directory}/bin/lime.py '
	call += 'build {name} '
	call += '--project_paths_file="{project_directory}/bin/project_paths" '
	call += '--use-strict '
	call += '--advanced '
	call += '--output_file="{project_directory}/bin/compiled/advanced/{name}.js" '
	call += '--output_mode="compiled" '

	subprocess.call(call,shell=True)
if __name__ == '__main__':
	main()
