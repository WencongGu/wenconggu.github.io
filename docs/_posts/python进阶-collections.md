---
title: python进阶-collections
date: 2024-02-01 23:51:32
tags: Python
---

`collections` 是 Python 标准库中的一个模块，提供了额外的数据结构类型，这些数据结构类型实现了特定目标的容器，扩展了内置的数据结构类型（如列表、元组、字典等），并提供了更多的功能和灵活性。

`collections` 模块扩展了Python标准数据类型的功能，提供更多高级的数据结构，以满足特定的需求和场景。它的设计目的是为了让开发者能够更方便地处理各种数据结构，提高代码的可读性、可维护性和性能。

注意这是 Python 的高级用法。

<!--more-->

## 概述

[官方文档](https://link.zhihu.com/?target=https%3A//docs.python.org/3/library/collections.html%23module-collections)

[官方文档中文版](https://link.zhihu.com/?target=https%3A//docs.python.org/zh-cn/3/library/collections.html%23module-collections)

可以使用 `collections.__all__` 变量查看模块支持的子类：

```python
import collections
print(collections.__all__)

# Output
['deque', 'defaultdict', 'namedtuple', 'UserDict', 'UserList', 
'UserString', 'Counter', 'OrderedDict', 'ChainMap']
```

这个模块实现了特定目标的容器，以提供Python标准内建容器`dict` , `list` , `set` , 和 `tuple` 的替代选择。

|类名|备注|
|:-:|:-:|
namedtuple|	创建元组子类的工厂函数，生成的tuple子类字段是用名称的，可以使用这个名称访问其值
deque|	类似列表(list)的容器，但添加（append）和弹出（pop）在其两端的速度都很快。
ChainMap|	类似字典(dict)的容器类，将多个映射集合到一个视图里面
Counter|	字典的子类，提供了可哈希（hashable）对象的计数功能
OrderedDict|	字典的子类，存储了添加的顺序，即有序字典
defaultdict|	字典的子类，通过调用提供的工厂函数，为键提供一个默认值
UserDict|	封装了字典对象，简化了字典子类化
UserList|	封装了列表对象，简化了列表子类化
UserString|	封装了字符串对象，简化了字符串子类化

>`__all__` 是 python 中的一个魔术变量 ，用于定义一个模块中哪些成员（变量、函数、类等）应该被导入。当一个模块被导入时，解释器会检查该模块是否定义了 `__all__` 变量，如果定义了，那么只有 `__all__` 中列出的成员会被导入，其他未列出的成员将不会被导入。`__all__` 的作用是控制模块的公开接口，可以帮助开发者明确指定哪些成员是模块对外公开的，如果不指定这个变量，默认的导入所有的全局变量、函数和类。因此它有助于提高模块的可维护性。

## 计数器 `Counter`

`Counter` 是 `collections` 模块中的一个类，用于统计可哈希对象（如字符串、列表等）中各元素出现的次数。使用 `Counter` 可以方便地进行元素计数，统计频率等操作。

下面是一些常用的 `Counter` 方法：

- `Counter(elements)`: 创建一个 `Counter` 对象，其中 `elements` 可以是可迭代对象，如列表、字符串等。

- `elements()`: 返回一个迭代器，包含所有元素，每个元素重复出现的次数与它在 `Counter` 对象中的计数相同。

- `most_common(n)`: 返回计数最多的 `n` 个元素及其计数，以列表的形式返回。

- `update(elements)`: 使用 `elements` 更新 `Counter` 对象中的计数。

下面是一个简单的示例，演示了如何使用 `Counter` 类进行元素计数：

```python
from collections import Counter

# 创建一个 Counter 对象
data = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple']
counter = Counter(data)

# 访问元素计数
print(counter['apple'])  # 输出 3

# 获取计数最多的两个元素
print(counter.most_common(2))  # 输出 [('apple', 3), ('banana', 2)]

# 更新计数
counter.update(['apple', 'orange'])
print(counter['orange'])  # 输出 2
```

在这个示例中，我们首先创建了一个 `Counter` 对象来统计列表 `data` 中各元素的出现次数。然后，我们演示了如何访问特定元素的计数、获取计数最多的元素以及更新计数。通过 `Counter` 类，我们可以方便地进行元素计数和统计分析。

## 双向队列 `deque`

`deque` 是 c`ollections` 模块中的一个类，用于实现双端队列（double-ended queue）。`deque` 提供了高效的插入和删除操作，可以在队列的两端进行操作，是一个非常实用的数据结构。以下是 `deque` 的一些常见用法：

- 导入 `deque` 类：首先需要从 `collections` 模块中导入 `deque` 类。
```python
from collections import deque
```

- 创建 `deque` 对象：可以使用 `deque()` 函数创建一个空的 `deque` 对象，也可以使用可迭代对象初始化 `deque` 对象。

```python
# 创建空的 deque 对象
d = deque()

# 使用可迭代对象初始化 deque 对象
d = deque([1, 2, 3, 4, 5])
```

- 添加和删除元素：`deque` 支持从队列的两端添加和删除元素，可以使用 `append()` 和 `appendleft()` 方法在右端和左端添加元素，使用 `pop()` 和 `popleft()` 方法在右端和左端删除元素。
```python
d.append(6)  # 在右端添加元素
d.appendleft(0)  # 在左端添加元素

print(d)  # 输出 deque([0, 1, 2, 3, 4, 5, 6])

d.pop()  # 从右端删除元素
d.popleft()  # 从左端删除元素

print(d)  # 输出 deque([1, 2, 3, 4, 5])
```

- 旋转 `deque`：可以使用 `rotate()` 方法将 `deque` 中的元素向右或向左旋转指定步数。

```python
d.rotate(2)  # 将 deque 向右旋转2步
print(d)  # 输出 deque([4, 5, 1, 2, 3])
```

- 获取元素：可以通过下标访问 `deque` 中的元素，也可以使用 `reverse()` 方法将 `deque` 中的元素顺序反转。
```python
print(d[0])  # 输出 4

d.reverse()  # 反转 deque 中元素的顺序
print(d)  # 输出 deque([3, 2, 1, 5, 4])
```

通过以上方法，您可以灵活地使用 deque 类来实现双端队列的操作，适用于需要频繁在队列两端进行操作的场景。

## 有序字典 `OrderedDict`

`OrderedDict` 是 Python 标准库 `collections` 模块中的一个数据结构，它是一个有序的字典，可以记住元素插入的顺序。

它的大部分操作都与普通字典相同，下面是使用 `OrderedDict` 的一些其他操作：

- 导入模块

```python
from collections import OrderedDict
```

- 创建一个 `OrderedDict`：

```python
# 创建一个空的 OrderedDict
od = OrderedDict()

# 创建一个带有初始元素的 OrderedDict
od = OrderedDict([('a', 1), ('b', 2), ('c', 3)])
```


- 按插入顺序输出键值对：

```python
print(od)  
# 输出 OrderedDict([('a', 1), ('b', 2), ('c', 3), ('d', 4), ('e', 5)])
```

- 相对于通常的映射方法，有序字典还另外提供了逆序迭代的支持，通过 `reversed()`。

```python
d = OrderedDict.fromkeys('abcde')
list(reversed(d))
# 输出 ['e', 'd', 'c', 'b', 'a']
```

- 移动元素到最后：

```python
od.move_to_end('a')  
# 将键为 'a' 的元素移动到最后
```

- 删除：

`OrderedDict` 提供一个特殊的删除函数：`popitem(last=True)`。

功能：有序字典的 `popitem()` 方法移除并返回一个 `(key, value)` 键值对。 如果 `last` 值为真（默认），则按 **LIFO** **后进先出**的顺序返回键值对，否则就按 **FIFO** **先进先**出的顺序返回键值对。


```python
from collections import OrderedDict
d = OrderedDict.fromkeys('abcde')
print(d.popitem())
# 输出 ('e', None)

print(d)
# 输出 OrderedDict([('a', None), ('b', None), ('c', None), ('d', None)])

#last=False时，弹出第一个
d = OrderedDict.fromkeys('abcde')
print(''.join(d.keys()))
# 输出 'abcde'

d.popitem(last=False)
print(''.join(d.keys()))
# 输出 'bcde'
```

`OrderedDict` 与普通的字典类似，但它可以保持元素的插入顺序。在需要记住元素插入顺序的场景下，可以使用 `OrderedDict`。

## 可命名元组 `namedtuple`

生成可以使用名字来访问元素内容的tuple子类，命名元组赋予每个位置一个含义，提供可读性和自文档性。它们可以用于任何普通元组，并添加了通过名字获取值的能力，通过索引值也是可以的。相当于一方面是可以使用类似字典的索引，一方面保留索引值的方式。

使用：

- 创建 `namedtuple` 类型：

```python
# 定义一个 namedtuple 类型，指定字段名称
Person = namedtuple('Person', ['name', 'age', 'gender'])
```

- 创建实例：

`namedtuple` 的构造器实际上是一个**工厂函数**，用于创建具有命名字段的新的元组子类。

```python
# 使用定义的 Person 类型创建一个具体的实例
person1 = Person(name='Alice', age=30, gender='Female')
person2 = Person(name='Bob', age=25, gender='Male')
```

- 通过索引和属性名访问 `namedtuple` 的元组元素：

```python
print(person1[0])  # 通过索引访问元组元素，输出 'Alice'
print(person2.gender)  # 通过属性名访问元组元素，输出 'Male'
```

- 转换为字典：

```python
person_dict = person1._asdict()
print(person_dict)  # 输出 OrderedDict([('name', 'Alice'), ('age', 30), ('gender', 'Female')])
```

- 替换某个字段值：

```python
person1 = person1._replace(age=35)
print(person1)  # 输出 Person(name='Alice', age=35, gender='Female')
```

`namedtuple` 可以让元组的元素具有更好的可读性和可访问性，适用于需要轻量级的数据对象的场景。通过定义字段名称，可以更方便地访问元组的元素。

## 默认字典 `defaultdict`

使用`dict`时，如果引用的`key`不存在，就会抛出`KeyError`。如果希望`key`不存在时，返回一个默认值，就可以用`defaultdict`。

可以创建一个 defaultdict 对象，并指定默认值的类型，比如 int、list、set 等：

```python
# 创建一个默认值为 int 类型的 defaultdict
int_dict = defaultdict(int)

# 创建一个默认值为 list 类型的 defaultdict
list_dict = defaultdict(list)

# 创建一个默认值为 set 类型的 defaultdict
set_dict = defaultdict(set)
```

接下来，可以像普通的字典一样向 defaultdict 中添加元素：

```python
s  = [('yellow', 1), ('blue', 2), ('yellow', 3), ('blue', 4), ('red', 1)]
for k, v in s:
    list_dict[k].append(v)
print(list(list_dict.items())) # 输出 [('yellow', [1, 3]), ('blue', [2, 4]), ('red', [1])]


int_dict['a'] += 1
int_dict['b'] += 2
print(list(int_dict.items()))  # 输出 [('a', 1), ('b', 2)]

list_dict['fruits'].append('apple')
list_dict['fruits'].append('banana')
print(list(list_dict.items()))  # [('fruits', ['apple', 'banana'])]

set_dict['colors'].add('red')
set_dict['colors'].add('blue')
print(list(set_dict.items()))  # [('colors', {'red', 'blue'})]
```

如果访问了不存在的键，`defaultdict` 会使用默认值来初始化该键的值，这样就避免了 `KeyError` 错误。这使得在处理字典时更加方便，特别是在统计计数、分组等场景下很有用。

## 映射链 `ChainMap`

`ChainMap`最基本的使用，可以用来合并两个或者更多个字典，当查询的时候，从前往后依次查询。`ChainMap`是由Python标准库提供的一种数据结构，允许你将多个字典视为一个。换句话说:`ChainMap`是一个基于多`dict`的可更新的视图，它的行为就像一个普通的`dict`。

查找映射时，找到一个就不找。这个列表是按照第一次搜索到最后一次搜索的顺序组织的，搜索查询底层映射，直到一个键被找到。更新原始映射时，写、更新和删除只操作第一个映射。

示例：

```python
from collections import ChainMap 
baseline = {'music': 'bach', 'art': 'rembrandt'}
adjustments = {'art': 'van gogh', 'opera': 'carmen'}
ChainMap(adjustments, baseline)
ChainMap({'art': 'van gogh', 'opera': 'carmen'}, {'music': 'bach', 'art': 'rembrandt'})
print(list(ChainMap(adjustments, baseline)))
# 输出 ['music', 'art', 'opera']

#存在重复元素时，也不会去重
dcic1 = {'label1': '11', 'label2': '22'}
dcic2 = {'label2': '22', 'label3': '33'}
dcic3 = {'label4': '44', 'label5': '55'}
last  = ChainMap(dcic1, dcic2,dcic3)
print(last)
# 输出 ChainMap({'label1': '11', 'label2': '22'}, {'label2': '22', 'label3': '33'}, {'label4': '44', 'label5': '55'})
```

## `UserDict`、`UserList`、`UserString`

属于用户自定类，可以改写原生python数据结构的一些行为来满足不同的需求。

比如自定字典，就可以继承 `UserDict` 类：

```python
class MyDict(UserDict):
    def __getitem__(self, key):
        print("Getting item")
        return super().__getitem__(key)

    def __setitem__(self, key, value):
        print("Setting item")
        super().__setitem__(key, value)

    def __delitem__(self, key):
        print("Deleting item")
        super().__delitem__(key)

    def keys(self):
        print("Custom keys method")
        return list(self.data.keys())
```

通过继承 UserDict 类，并重写其中的方法，可以自定义字典类的行为，添加额外的逻辑或功能。使用时只需要按照正常的字典来操作即可，不过此时字典的行为是我们自定的函数。

同样，自定义 `UserList` 类：

```python
class MyList(UserList):
    def append(self, item):
        print("Appending item")
        super().append(item)

    def remove(self, item):
        print("Removing item")
        super().remove(item)
```

自定义 `UserString` 类：

```python
class MyString(UserString):
    def append(self, char):
        self.data += char

    def remove(self, char):
        self.data = self.data.replace(char, '')
```

可以根据需要设计不同的方法来满足项目需求。