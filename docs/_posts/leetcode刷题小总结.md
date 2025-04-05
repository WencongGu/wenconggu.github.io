---
title: leetcode刷题小总结
date: 2023-11-30 21:26:43
tags: Coding, Algorithm
mathjax: true
---

算法学得再好要是要最终落地解决问题的。但是想要解决好实际问题并不容易。提高自己的代码能力也是一个不断积累的过程。一个知名且有效的刷题网站当然非leetcode莫属。

这篇文章就是想要记录一下我在刷题过程中遇到的一些能够有效提高代码水平的小技巧和编程实现方式，但是并不记录高超的算法设计，大的或者精妙的算法设计不适合用博客记录，我都记在自己的小本本上。

格式也乱七八糟的，总体而言是比较随性的博客。

持续记录中...

<!--more-->

#### python

$\bullet$
列表根据值获取索引：`l.index(v)`

列表、集合元素的删除都可以使用 `remove(value)`，如果 `value` 不在集合或者列表中则抛出异常。

对于列表，可以根据索引值删除：`popped = l.pop(index)`，就是说它不只是可以用作栈，而且返回值是抛出的元素。

对于集合，可以使用 `discard(value)` 删除对应值，不过这个值即使不存在也不会抛出异常。

$\bullet$ **`dict` 字典**
字典的键集：`d.keys()`，值集：`d.values()`，键值对：`d.items()`

```python
d={'a':1,'b':2,'c':3}
list(d.items())

[('a', 1), ('b', 2), ('c', 3)]
```
可以直接用`in`检查元素是不是在某个集合里，不必使用list。放心用，在Java里也有类似的方法，属于是哈希表的特性了。

但是判断某个键是否在字典中直接用 `in` 就行了，不用再用 `keys()`，比如 `string in my_dict`。

删除键值对使用 `pop()` 函数或者 `del` 关键字，比如 `my_dict.pop('my_key')`，`del my_dict['my_key']`

$\bullet$ **`set` 集合**

特点：

- `set` 中的元素是无序的，即没有索引，不能通过索引访问元素。
- `set` 中的元素是唯一的，不会重复。
- `set` 中只能存储不可变（immutable，或者可哈希的 hashable）的对象，如数字、字符串、元组等，不能存储可变对象如列表、字典。

操作：

- 增：使用 `add()` 方法向 `set` 中添加元素，如果元素已经存在，则不会重复添加。
- 删：使用 `remove()` 或 `discard()` 方法删除指定元素，如果元素不存在，`remove()` 会抛出 `KeyError` 异常，而 `discard()` 不会。
- 运算：可以对 `set` 进行并集、交集、差集等操作，如 `union()`, `intersection()`, `difference()` 等：
  + $\mathrm{A}\cap \mathrm{B}$
    ```python
    A.intersaction(B)
    ```
  + $\mathrm{A}\cup \mathrm{B}$
    ```python
    A.union(B)
    ```
  + $\mathrm{A} - \mathrm{B}$
    ```python
    A.difference(B)
    ```
  + $?: \mathrm{A}\subset \mathrm{B}$
    ```python
    A.issuperset(B)
    ```
- 查：一般使用 `for` 循环遍历集合

Python 中还有一种不可变集合 `frozenset`，使用 `frozenset()` 函数创建，与 `set` 不同的是，`frozenset` 是不可变的，即不能添加、删除或修改元素。

$\bullet$
使用`for`循环时有时会既要遍历元素又要遍历索引，直接用`enumerate()`即可。

```python
for i, num in enumerate(nums):
    pass
```

$\bullet$ **`del` 关键字**
python 中 `del` 关键字用于**删除对象的引用**。`del` 可以用于删除变量、列表中的元素、字典中的键值对等。它常用于：

- 删除变量
  使用 `del` 可以删除一个变量，释放其所引用的对象，让变量不再指向任何对象。示例：`del my_var`，但是此时对象本身依然存在，只是引用计数减1。
- 删除列表中的元素：
  使用 `del` 可以删除列表中指定索引位置的元素。示例：`my_list = [1, 2, 3]`，`del my_list[1]` 将删除列表中索引为 1 的元素。
- 删除字典中的键值对：
  使用 `del` 可以删除字典中指定键值对。示例：`my_dict = {'a': 1, 'b': 2}`，`del my_dict['a']` 将删除字典中键为 `'a'` 的键值对。
- 删除对象属性：
  使用 `del` 可以删除对象的属性。示例：`class MyClass: pass`，`obj = MyClass()`，`obj.attr = 10`，`del obj.attr` 将删除对象 `obj` 的属性 `attr`。

Python 会自动管理内存，当一个对象没有任何引用时，Python 的垃圾回收机制会自动回收这部分内存。

$\bullet$
使用 `ord(my_char)` 获取 `my_char` 对应的 unicode 编码号。注意，`my_char` 只能是单个字符。返回值是一个 int。

在 unicode 中，大写字母对应编码为 65-90，小写字母为 97-122。可以根据这个获取字母在字母表中的排序，比如 `order_a=ord('a')-97 # 0`。

$\bullet$
使用二维数组初始化时，或者使用对象引用初始化数组时要当心。就是说使用 `a = [ref_element] * N` 的语法时要注意，**这个初始化得到的列表中每一个元素都指向同一个对象**。也就是说修改一个就会修改全部的值。但是对于数据类型就没问题。使用 `list_of_number = [num] * N` 和 `list_of_object = [constructor_obj() for _ in range(N)]` 可以解决问题。要注意，不然出错会很难受。

#### 逻辑

$\bullet$
在求最值的问题中常常需要去二者的极大值，比如类似以下逻辑：
```python
max_value = 0
for i in a_list:
    max_value = max(max_value, i)
```
这里使用`max`是每次都会调用的，显然它的效率不如：
```python
max_value = 0
for i in a_list:
    if max_value<i:
        max_value=i
```

很弱的“优化”。

$\bullet$
使用双指针时，想要使得left始终在right左边，循环条件是 `left < right - 1` 或者 `right > left + 1`，注意要有 `+ 1`，是个容易忽视的小细节。

$\bullet$
使用 `while` 循环时，循环条件要尤其注意边界值。

可以是 `while i < n` 也可能是 `while i < n+1`。

$\bullet$
**合并 `if` 语句时要谨慎**

比如下面两个 `if` 语句**不等价**：

```python
# Statement 1
for i in name:
    if i=='..':
        if stack:
            stack.pop()
    elif i and i!='.':
        stack.append(i)

# Statement 2
for i in name:
    if i=='..' and stack:
            stack.pop()
    elif i and i!='.':
        stack.append(i)
```


这是因为 `if` 语句的判定在进入一个分支后不会进入另一个，但是对于 `if-else` 语句如果没有进入一个分支就会进行第二个判断。

对于第1个写法，如果变量 `i` 为 `'..'` 但是 `stack` 为空，会进入第一个分支，但是不会进入里面的 `if` 判断，所以循环最终什么也不做。

但是同样的情况对与第二种写法就不一样了，不满足第一个判断分支后就会进行第二个分支判断，而它恰好满足第二个分支，因为 `i` 是 `'..'`，显然满足 `i and i!='.'`，会运行分支语句，造成错误。

因此做代码优化时一定要注意谨慎。

$\bullet$
下列总结来自[找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/solutions/1123971/zhao-dao-zi-fu-chuan-zhong-suo-you-zi-mu-xzin/?envType=study-plan-v2&envId=top-100-liked)

在判断字母异位词（两个字符串包含的字母及其个数相同）时，一个很重要的问题就是如何判断两个字符串是不是异构的，朴素的想法就是对两个字符串直接排序，然后直接比较是否相等即可。显然这样会有效率问题。

一种简单的想法是维护两个哈希表，分别记录目标字符串和当前字符串出现的字符及其数量。这完全可行，新加入字符时如果它在表中就加1，不在表中就置0，删除字符时就减1，最后比较两个哈希表就行。但是对于滑动窗口这种做法很麻烦，因为对于某个字符，或许它根本不在目标字符串中，而在某个字符串中出现，因此哈希表中就有这个键，随后滑动窗口时这个字符数量变为0，而此时这个哈希表需要删除这个键值对，否则它和目标字符串的哈希表一定不同，即使字符串相同。这就对于判断逻辑造成一定的麻烦。

一种比较优秀的想法是维护一个长度为 26 的数组，分别记录每个元素对应的数量，初始化为0即可。这与哈希表的思路没有本质上的不同，只是操作更加方便。判断时直接比较数组即可。

比较方法也有很多，或者可以赋予数组不同含义。上面的数组含义就是每个字母出现的次数。也可以这样维护这个数组：对于第一个字符串，存储它与目标字符串每个字符的差异，某个元素为 $n$ 表示对应字符在当前字符串的出现次数比目标字符串多 $n$次，$-n$ 表示少 $n$ 次，为 0 则相等。于是两个字符串的差异可以用不为 0 的元素个数来表示。

$\bullet$
题目：
>给定一个仅由两个字符 'A' 和 'B' 组成的字符串 s，求 s 中包含 'A' 和 'B' 个数相同的连续区间的最长长度。

和上面一样，还是要统计字符出现的次数。这次只需要考虑两个字符出现的次数差异，因此这里使用一个变量就足够了。

怎么做呢？和上面的想法一样，用一个初始值为0的变量，然后遍历字符串，如果当前字符是 'A'，那么这个变量加1，是 'B' 则减1。这样就成功地只使用一个变量记录了每次遍历位置之前的二者数量差。

当然这里还是因为题目是在「连续区间」中。

其他的分析都是基于这个题目的特殊性了，不过十分巧妙。只包含两个字符，如果在某个位置二者数量差是 $\Delta$，继续遍历，这个差值一下加一一下减一，然后过了几个位置，如果发现这个差值重新变成了 $\Delta$，说明了什么？说明从上个相同差异位置到当前位置这一个区间内两个字符数量相等。所以加一减一后差又变回 $\Delta$。于是就使用一个字典记录每个位置的差值，或者每个差值的对应位置。显然应当选取后一种记录方式，因为我们要找的是最长的区间，也就是说当上述情况发生时，需要找到的是第一个差值为 $\Delta$ 的位置。字典刚好可以满足这样的需求。

参考代码：

```python
def equal_AB_substring_length(s):
    count = 0
    diff_counts = {0: -1}
    max_length = 0
    
    for i in range(len(s)):
        if s[i] == 'A':
            count += 1
        else:
            count -= 1
        
        if count not in diff_counts:
            diff_counts[count] = i
        else:
            max_length = max(max_length, i - diff_counts[count])
    
    return max_length
```

$\bullet$
**`if` 语句的逻辑判断**

`if` 语句的逻辑判断是**短路**的，也就是说如果第一个判断条件满足，那么第二个判断条件就不会再执行了。

$\bullet$
**`if` 语句的逻辑判断**

#### 编程思想

武器库。没有思路的时候就想想看自己掌握了什么。

**双指针**

这个挺常见的，还是比较容易想到的。第一次看到这个用法惊为天人。

**(单调)栈**

栈的数据结构很奇妙。不容易想到。单调栈更是迷。leetcode知名题目[接雨水](https://leetcode.cn/problems/trapping-rain-water/description/?envType=study-plan-v2&envId=top-interview-150)，但是也会用于数学表达式分析，比如[计算后缀表达式](https://leetcode.cn/problems/evaluate-reverse-polish-notation/description/?envType=study-plan-v2&envId=top-interview-150)，或者将前缀表达式转化为后缀表达式，或者[霍夫曼编码](https://oi-wiki.org/ds/huffman-tree/)

**哈希表**

主要是这种数据结构能够快速查找元素，主要是能够轻松使用它构造一个集合，用来检查某元素是否在这个集合中，所以常常被用来做一些去重操作。

虽然多占空间，但是一般空间复杂度要求是比较低的，所以大胆用。

**滑动窗口**

想要检查的元素集长度可控（定长、单调、有限）时，可以使用一个窗口，逐个检查窗口内元素是否符合要求。优化是可以的，但是通常效果不会很明显。直接遍历就行。

**动态规划**

一大算法思想。

**BFS & DFS**

注意标记值操作，返回值的设计，条件判断。