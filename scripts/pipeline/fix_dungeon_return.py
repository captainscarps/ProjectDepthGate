import sys

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    bad_snippet = '/*__PZL__*/__pzAuto(this);try{window.DEPTHGATE_ENVIRONMENTAL?.ProceduralEnvironmentManager?.initDungeonEnvironment?.(this.scene,this)}catch(_e){};this.map=i,this}'
    good_snippet = '/*__PZL__*/__pzAuto(this),__envAuto(this),this.map=i,this}'

    env_func = 'function __envAuto(B){try{window.DEPTHGATE_ENVIRONMENTAL?.ProceduralEnvironmentManager?.initDungeonEnvironment?.(B?.scene,B)}catch(_e){}}'

    if bad_snippet in content:
        content = content.replace(bad_snippet, good_snippet, 1)
        if '__envAuto(' not in content or 'function __envAuto' not in content:
            # Inserir antes de __pzAuto
            idx = content.find('function __pzAuto')
            content = content[:idx] + env_func + '\n' + content[idx:]
        print(f"Fixed build() return and added __envAuto in {filepath}")
    else:
        print(f"Bad snippet not found in {filepath}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    fix_file('assets/index-D6qIWtA7-p209.js')
    fix_file('Projeto atualizado/assets/index-D6qIWtA7-p209.js')
