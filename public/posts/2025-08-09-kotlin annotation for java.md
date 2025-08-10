### Five Kotlin–Java Interop Annotations: @JvmOverloads, @JvmStatic, @JvmField, @JvmName, @JvmMultifileClass

These annotations share the same goal: make calling Kotlin from Java feel natural. Below are concise explanations and focused examples for each.

---

## @JvmOverloads

- Generate Java-friendly overloads for Kotlin functions/constructors that have default parameters.

### Example: function
```kotlin
@JvmOverloads
fun test(a: String, b: Int = 0, c: String = "abc") {
    // ...
}
```

Java will see the following overloads:
```java
void test(String a);
void test(String a, int b);
void test(String a, int b, String c);
```

### Example: constructor
```kotlin
class MyLayout : LinearLayout {
    @JvmOverloads
    constructor(
        context: Context,
        attrs: AttributeSet? = null,
        defStyleAttr: Int = 0
    ) : super(context, attrs, defStyleAttr)
}
```

Equivalent Java:
```java
public class MyLayout extends LinearLayout {
    public MyLayout(Context context) { this(context, null); }
    public MyLayout(Context context, AttributeSet attrs) { this(context, attrs, 0); }
    public MyLayout(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }
}
```

---

## @JvmStatic and @JvmField

- Expose members inside a `companion object` or `object` as true static methods/fields to Java.

### Without annotations
```kotlin
class TestStatic {
    private val num = 0

    companion object {
        val S = "a"
        fun test() { println("call method") }
    }
}
```

Java call site:
```java
TestStatic.Companion.test();
String s = TestStatic.Companion.getS();
```

### With annotations
```kotlin
class TestStatic {
    private val num = 0

    companion object {
        @JvmField
        val S = "a"

        @JvmStatic
        fun test() { println("call method") }
    }
}
```

Java regains the intuitive static style:
```java
TestStatic.test();
String s = TestStatic.S;
```

- Key points:
  - @JvmStatic: Use on functions to turn them into real static methods.
  - @JvmField: Use on properties to expose them as real static fields (no generated getter).
  - For `const val` (compile-time constants), you typically do not need `@JvmField`; they become static constants automatically.

---

## @JvmName

- Rename the generated JVM “class name” or method name to improve Java ergonomics or avoid conflicts.

### File-level rename (top-level declarations)
If you have `PersonFile.kt`, Java uses the file name as the class name by default. To call `Person.xxx` instead of `PersonFile.xxx` in Java:
```kotlin
@file:JvmName("Person")
```

Then Java can call:
```java
Person.xxx();
```

You may also apply it to individual functions to resolve naming conflicts or improve naming on the Java side.

---

## @JvmMultifileClass

- Merge multiple Kotlin files into a single Java-facing facade class. Each file must share the same `@file:JvmName` and also apply `@file:JvmMultifileClass`.

### Example
```kotlin
// oldutils.kt
@file:JvmName("Utils")
@file:JvmMultifileClass

package demo

fun foo() {}
```

```kotlin
// newutils.kt
@file:JvmName("Utils")
@file:JvmMultifileClass

package demo

fun bar() {}
```

Java call site:
```java
demo.Utils.foo();
demo.Utils.bar();
```

---

## Summary

- @JvmOverloads: Generate Java overloads for default parameters (functions and constructors).
- @JvmStatic: Expose functions in companions/objects as static methods; Java calls `ClassName.method()`.
- @JvmField: Expose properties in companions/objects as static fields; Java calls `ClassName.FIELD`. `const val` usually does not require this annotation.
- @JvmName: Rename file-level class names or function names for better Java ergonomics or to avoid conflicts.
- @JvmMultifileClass: Allow multiple files to share a single Java facade class; requires the same `@file:JvmName`.
