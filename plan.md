1. 先初始化项目，也就是创建出一个对象
```json
{
  "content": [],
  "page_settings": [],
  "version": "0.4",
  "title": "page",
  "type": "page"
}
```
所有操作都是往content增加元素

2. 添加容器或者部件
3. 开始设定容器或者部件

可以通过id来索引用元素
只有存在的元素才能进行设置

面向对象

elements中设定content，而settings中只设定helper，
然后elements中规定，这个元素可以使用那些helper

1. heading
   align：start | center | end | justify
   title_color: {{color}}
   title_hover_color: {{color}}
2. button
   align: left | center | right | justify
   button_text_color: {{color}}
   hover_color：{{color}} 指文本悬停颜色
   background_color: {{color}}
   button_background_hover_color: {{color}}
   border_color:{{color}}
   button_hover_border_color:{{color}}
   border_border: "solid",
   border_width:{{
        "unit": "px",
        "top": "1",
        "right": "1",
        "bottom": "1",
        "left": "1",
        "isLinked": true
   }}
   button_box_shadow: 
3. text
   text_color：{{color}}
4. image
    width
    space 最大宽度
    height
    object-fit
    object-position
    image_border 组合修改
    image_border_radius 组合修改