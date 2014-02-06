#!/usr/bin/env python

import subprocess

def main():
	call = 'python {limejs_directory}/bin/lime.py '
	call += 'build {name} '
	call += '--output_file="../compiled/list/{name}.txt" '
	call += '--output_mode="list" '

	subprocess.call(call,shell=True)
if __name__ == '__main__':
	main()
