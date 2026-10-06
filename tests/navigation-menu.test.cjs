const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
test('horizontal groups open only authorized children, navigate on click and close on Escape',()=>{
 const listeners={};const menu={hidden:true,dataset:{},style:{},children:[],setAttribute(){},replaceChildren(){this.children=[];},appendChild(x){this.children.push(x);},querySelector(){return this.children[0];},querySelectorAll(){return this.children;},addEventListener(k,f){listeners[k]=f;}};
 let selected,focused=0;
 const document={body:{appendChild(){}},createElement(tag){return tag==='nav'?menu:{addEventListener(k,f){this[k]=f;},focus(){focused++;}};},addEventListener(){}};
 const context=vm.createContext({document,window:{innerWidth:1200,innerHeight:800,addEventListener(){}},bethaApp:{getBoundingClientRect:()=>({left:400,bottom:60})},isViewAllowed:view=>view==='configuracoes-admin',navigate:view=>selected=view});
 const source=fs.readFileSync('app.js','utf8');vm.runInContext(source.slice(source.indexOf('  const groupNavigationMenu='),source.indexOf('  bethaApp.addEventListener("opcaoMenuSelecionada"')),context);
 const group={id:'grupo-administracao',submenus:[{id:'usuarios-admin',descricao:'Usuários'},{id:'configuracoes-admin',descricao:'Configurações'}]};
 context.openGroupNavigation(group);assert.equal(menu.hidden,false);assert.equal(menu.children.length,1);assert.equal(menu.children[0].textContent,'Configurações');assert.equal(focused,1);
 menu.children[0].click();assert.equal(selected,'configuracoes-admin');assert.equal(menu.hidden,true);
 context.openGroupNavigation(group);listeners.keydown({key:'Escape',preventDefault(){}});assert.equal(menu.hidden,true);
 context.openGroupNavigation({...group,submenus:[group.submenus[0]]});assert.equal(menu.hidden,true);
});
