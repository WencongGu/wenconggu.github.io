---
title: SQL标准基础
date: 2023-12-15 17:12:14
tags: SQL
mathjax: true
---

SQL(Structured Query Language) 结构化查询语言是关系数据库的标准语言，包括数据查询、数据库模式创建、数据库数据的增删改、数据库安全性和完整性定义与控制等一系列功能。

本文简单整理，相当于个人的一个使用手册。

<!--more-->

## 关系模型

关系就是一个规范化的二维表。所谓「规范化」，就是指关系的每一个分量都必须是一个不可分的数据项。

一个关系中的一条记录就是一个元组，元组有属性，即分量，有码，即可以唯一确定一个元祖的属性。元组的每个属性都有一个取值范围，这个范围称为域。

符号表示一个关系模式就是

$$R(U,D,DOM,F)$$

其中，$U$是关系的名称，$D$是关系的属性集合，$DOM$是属性$D$的取值范围，$F$是关系$R$的码。

一个关系中可以唯一标识一个元组的一个属性或者一组属性称为候选码，选定其中一个候选码作为主码。候选码中的属性称为主属性。

两个集合可以作笛卡尔积，形式化定义为

$$D_1\times D_2\times\cdots\times D_n=\{(d_1,d_2,\cdots,d_n)|d_i\in D_i,i=1,2,\cdots,n\}$$

关系也可以作笛卡尔积，但是通常的笛卡尔积没有实际意义，只有其中某个子集有实际语意。

我们需要对关系进行操作。常用的关系操作包含查询和更新两部分。

查询操作包括

- 选择(Select)
- 投影(Project)
- 连接(Join)
- 除(Divide)
- 并(Union)
- 差(Difference)
- 交(Intersection)
- 笛卡尔积(Cartesian Product)

关系的查询表达能力很强，所以查询操作往往是关系操作中最重要的部分，其中又属选择、投影、并、差、笛卡尔积最为重要。

更新操作包括

- 插入(Insert)
- 删除(Delete)
- 修改(Update)


关系操作的对象和结果都是集合。

关系操作在早期使用代数方式和逻辑方式来表示，分别称为关系代数和关系盐酸。其他的关系数据语言如果能够表示关系代数可以表示的查询，就称它具有完备的表达能力，即关系完备性。关系代数、元组关系演算、域关系演算三种关系数据语言是等价的，都是完备的。

结构化查询语言SQL不仅具有丰富的查询功能，还具有数据定义和数据控制的功能，充分体现了关系数据的优点，80年代起成为关系数据库标准语言。

- 关系代数：如ISBL
- 关系演算；
  + 元组关系演算：如ALPHA、QUEL
  + 域关系演算：如QBE
- SQL，具有关系代数和关系演算的双重特点

## 关系代数

理解关系代数可以更好地了解SQL操作的逻辑。

关系代数是一种抽象的查询语言，它用对关系的运算来表达查询，它的运算对象和结果都是关系。使用到两类关系运算符：

- 集合运算：
  + $\cup$：并(Union)
  + $-$：交(Intersection)
  + $\cap$：差(Difference)
  + $\times$：笛卡尔积(Cartesian Product)
- 专门的关系运算：
  + $\sigma$：选择(Select)
  + $\sqcap$：投影(Project)
  + $\Join$：连接(Join)
  + $\div$：除(Divide)

选择，就是在关系中选择某些满足特定条件的诸元组。

投影，就是选择关系的某些属性，组成新的关系。

连接，分为几种类型，是对两个关系的操作，其大致思路就是先对两个关系作笛卡尔积，得到一个新关系，然后在按某种条件对新关系进行筛选。这个条件可能是某种相等，比如一个关系的某属性和另一个关系的某属性相等，这时的连接操作就是等值连接。当然也有非等值连接。在等值连接中，较为常用的一种是自然连接，它要求连接的条件是两个关系按照同名属性列相等进行连接。在进行自然连接时，根据同名列做连接的操作，可能会导致其中一个关系某些元组的属性值在另一个关系中不存在，这些元组就会被舍弃，被称为悬浮元组。 如果把悬浮元组也保存在结果关系中，而在其他属性上填上`NULL`，这种连接就称为外连接如果只保留左边关系的悬浮元组就叫做左外连接，保留右边关系中的悬浮元组，就叫做右外连接。

为了理解除运算，先要理解象集。给定一个关系，它的属性集表示为两部分，`X`和`Y`，某个元组在属性集`X`上的值为`x`，则可以定义在这个关系上`x`的象集，定义就是取出关系中那些属性集`X`上属性值为`x`的元组，它们在属性集`Y`上的取值构成的集合。

比如关系R：

|X|Y|
|-|-|
|$x_1$|$y_1$|
|$x_1$|$y_2$|
|$x_1$|$y_3$|
|$x_2$|$y_4$|
|$x_2$|$y_5$|
|$x_2$|$y_2$|
|$x_3$|$y_3$|

那么$x_1$的象集就是$\{y_1,y_2,y_3\}$，$x_2$的象集就是$\{y_4,y_5,y_6\}$，$x_3$的象集就是$\{y_2,y_3\}$。

除运算也是关于两个关系的运算。两个关系$R(X,Y)$和$S(Y,Z)$，作除运算，$R\div S$，得到一个新关系$P(X)$，也就是说，新关系的属性集首先是$R$的属性集$X$。其次，这个新关系包含的每个元组在$R$上的象集都包含了关系$S$（在属性集$Y$上的取值的集合）。

## SQL

核心功能

|功能|动词|
|:-:|:-:|
|数据定义|CREATE，DROP，ALTER|
|数据查询|SELECT|
|数据更新|INSERT，UPDATE，DELETE|
|数据控制|GRANT，REVOKE|

数据定义

|操作对象|创建|删除|修改|
|:-:|:-:|:-:|:-:|
|数据库|CREATE DATABASE|DROP DATABASE|无|
|表|CREATE TABLE|DROP TABLE|ALTER TABLE|
|视图|CREATE VIEW|DROP VIEW||
|索引|CREATE INDEX|DROP INDEX|ALTER INDEX|

### 模式

```SQL
CREATE SCHEMA [<name>] AUTHORIZATION <user>;
DROP SCHEMA [<name>] <CASCADE | RESRICT>;
```

如果没有指定`name`则默认为`user`。`CASCADE`表示删除模式时，同时删除该模式下所有的对象，`RESRICT`表示如果这个数据库下定义了对象则拒绝删除语句的执行。

### 基本表

```SQL
CREATE TABLE <table_name> (
    <column_name> <data_type> [column_CONSTRAINT] 
    [, <column_name> <data_type> [column_CONSTRAINT]]
    ...
    [,<table_CONSTRAINT>]
);
```

`column_CONSTRAINT`包括

- 主码约束
- 外码约束
- 非空约束
- 唯一约束
- 检查约束

数据类型是常用的数据类型，比如字符串`CHAR(n)`，整数`INT`，浮点数`FLOAT`，日期`DATE`，时间`TIME`，布尔值`BOOLEAN`，二进制`BINARY(n)`，文本`TEXT`，字节流`BLOB`。

修改使用

```SQL
ALTER TABEL <name>
    [ADD [COLUMN] <new_column> <data_type> [CONSTRAINT]]
    [ADD <table_CONSTRAINT>]
    [DROP [COLUMN] <column_name> [CASCADE | RESTRICT]]
    [DROP [CONSTRAINT] <constraint> [CASCADE | RESTRICT]]
    [RENAME [COLUMN] <column_name> to <new_column>]
    [ALTER [COLUMN] <column_name> TYPE <new_data_type>];
```

删除

```SQL
DROP TABLE <name> [CASCADE | RESTRICT];
```

### 索引

加快查询速度。

建立

```SQL
CREATE [UNIQUE] [CLUSTER] INDEX <index_name> 
    ON <table_name> (<column_name>[<ASC | DESC>] [, <column_name>[<ASC | DESC>]]...);
```

`UNIQUE`表明次缩影的每一个索引值只对应唯一的数据记录，`CLUSTER`表明建立聚簇索引。一个表上只能有一个聚簇索引。

修改

```SQL
ALTER INDEX <index_name> RENAME TO <new_index_name>;
```

删除

```SQL
DROP INDEX <index_name>;
```

### 查询

```SQL
SELECT [ALL | DISTINCT] <column_name>[alias] [, <column_name>[]alias]...
    FROM <table_name>[alias] [, <table_name>[alias]]...|(SELECT STATEMENT) [AS] <alias>
    [WHERE <condition>]
    [GROUP BY <column_name> [, <column_name>]...[HAVING <condition>]]
    [ORDER BY <column_name> [ASC | DESC] [, <column_name> [ASC | DESC]]...
    [LIMIT <row_count>[OFFSET <row_count>]];
```

字符串匹配可以用`LIKE`，`LIKE`可以匹配`%`和`_`。

要使用正则表达式用`REGEXP`。

去重可以用`DISTINCT`。

`GROUP BY`子句用于分组，值相等的为一组，分组结果相当于一个子表，可能有嵌套，此时是先对第一个值分组，再对每个组中的第二列分组。后面的操作比如聚合函数或者排序都是在最小的组内进行的。

### 插入数据

插入元组使用

```SQL
INSERT INTO <table_name> (<column_name>[, <column_name>]...)
    VALUES (<value>[, <value>]...);
```

插入子表使用

```SQL
INSERT INTO <table_name> (<column_name>[, <column_name>]...)
    SELECT STATEMENT;
```

修改

```SQL
UPDATE <table_name>
SET <column>=<value> [, <column_name>=<value>]
[WHERE <conditions>];
```

删除

```SQL
DELETE FROM <table_name>
[WHERE <conditions>];
```

### 视图

视图是虚拟的表，可以用来简化查询，也可以用来隐藏数据。

建立

```SQL
CREATE VIEW <view_name> [(<column_name>[, <column_name>...])]AS
    SELECT STATEMENT
    [WITH CHECK OPTION];
```

其中`WITH CHECK OPTION`表示视图的更新操作必须满足视图定义中的条件，比如`SELECT`语句中的`WHERE`子句，如果不符合定义，则拒绝更新操作。

建立好视图后就可以像正常的基本表一样进行查询、更新、删除等操作，还可以对视图建立视图。

### 安全性控制

授权

```SQL
GRANT <privilege> [, <privilege>]...
    ON <object_type> <object_name> [, <object_type> <object_name>]...
    TO <user> [, <user>]...
    [WITH GRANT OPTION];
```

`<privilege>`包括

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`
- `REFERENCES`
- `TRIGGER`

 如果指定了子句则获得某种权限的用户，还可以把这种权限再授予其他的用户如果没有指定该辞句则获得某种权限的用户，只能使用该权限，不能再授予其他用户。授予权限的用户可以是一个具体用户或者多个具体用户，也可以是`PUBLIC`。发出授权语句的用户可以使数据库管理员也可以是该数据库的创立者，也可以是已经拥有该权限的用户.

撤销

```SQL
REVOKE <privilege> [, <privilege>]...
    ON <object_type> <object_name> [, <object_type> <object_name>]...
    FROM <user> [, <user>]...
    [CASCADE | RESTRICT];
```

数据库角色，即权限的集合。

```SQL
/*创建角色*/
CREATE ROLE <role_name>;

/*删除角色*/
DROP ROLE <role_name>;

/*授权和回收权限*/
GRANT <privilege> [, <privilege>]...
    ON <object_type> <object_name> [, <object_type> <object_name>]...
    TO <role_name> [, <role_name>]...;
REVOKE <privilege> [, <privilege>]...
    ON <object_type> <object_name> [, <object_type> <object_name>]...
    FROM <role_name> [, <role_name>]...;
```

### 完整性控制

完整性控制即是`CONSTRAINT`，是关系数据库管理系统的重要功能，它确保数据库中数据的正确性、相容性和相容性。

完整性控制包括

- 实体完整性
- 参照完整性
- 用户定义完整性

实体完整性

```SQL
/*行级约束*/
CREATE TABLE <table_name> (
    <column_name> <data_type> PRIMARY KEY, [other columns]
    );

/*表级约束*/
CREATE TABLE <table_name> (
    <column_name> <data_type>, [other columns],
    PRIMARY KEY (<column_name>[, <column_name>...])
    );
```

参照完整性

```SQL
/*行级约束*/
CREATE TABLE <table_name> (
    <column_name> <data_type> 
    FOREIGN KEY (<column_name[,column_name...]>) REFERENCES <table_name> (<column_name>[, <column_name>...])
    );
```

如果某次操作破坏了参照完整性，则默认会拒绝执行这个操作。还有一种策略比如可以级联操作，或者设置为`NULL`。

用户定义完整性

包括属性上的约束和元组上的约束，这些约束有`NOT NULL`、`UNIQUE`、`PRIMARY KEY`、`FOREIGN KEY`、`CHECK`短句。

其中`CHECK`语句比较灵活。比如定义在元组上的约束可以是`CHECK(<column_name> <compare_to> <value>)`，具体`CHECK(column > 10)`表示插入的元组不能小于10.

可以使用`CONSTAINT`语句创建约束。

```SQL
CONSTRAINT <constraint_name> <constraint_type> 
```

其中`<constraint_type>`包括

- `PRIMARY KEY`
- `FOREIGN KEY`
- `CHECK`语句
- `NOT NULL`
- `UNIQUE`

### 触发器

触发器是数据库管理系统中的一种特殊对象，它由一个事件来触发，当事件发生时，触发器被激活，执行相应的操作。

```SQL
CREATE TRIGGER <trigger_name>
    {BEFORE | AFTER}
    {INSERT | UPDATE | DELETE | a_combination}
    ON <table_name>
    REFERENCING NEW|OLD ROW AS <new_row_name>|<old_row_name>
    FOR EACH {ROW | STATEMENT}
    [WHEN <condition>]
    BEGIN
        <trigger_body>
    END;
```

触发器由触发事件激活，由数据库服务器自动执行。一个表可以有多个触发器，其执行顺序如下：

- BEFORE 触发器
- 激活触发器的SQL语句
- AFTER 触发器

BEFORE和AFTER触发器分别可能有多个，此时按照它们的定义顺序执行。

删除

```SQL
DROP TRIGGER <trigger_name> ON <table_name>;
```

>参考书籍：《数据库系统概论》，王珊，杜小勇，陈红，编著，高等教育出版社，2023年3月第6版