# 二阶贝塞尔曲线实现

Android已提供绘制二阶贝塞尔曲线的方法quadTo(x,y,x2,y2)，因此代码实现非常简单基础，如下：
```java
/**
* Add a quadratic bezier from the last point, approaching control point
* (x1,y1), and ending at (x2,y2). If no moveTo() call has been made for
* this contour, the first point is automatically set to (0,0).
*
* @param x1 The x-coordinate of the control point on a quadratic curve
* @param y1 The y-coordinate of the control point on a quadratic curve
* @param x2 The x-coordinate of the end point on a quadratic curve
* @param y2 The y-coordinate of the end point on a quadratic curve
*/
public void quadTo(float x1, float y1, float x2, float y2) {
isSimplePath = false;
nQuadTo(mNativePath, x1, y1, x2, y2);
}
```
演示效果如下：

![](/assets/1.gif)

# 三阶贝塞尔曲线实现

```java
/**
* Add a cubic bezier from the last point, approaching control points
* (x1,y1) and (x2,y2), and ending at (x3,y3). If no moveTo() call has been
* made for this contour, the first point is automatically set to (0,0).
*
* @param x1 The x-coordinate of the 1st control point on a cubic curve
* @param y1 The y-coordinate of the 1st control point on a cubic curve
* @param x2 The x-coordinate of the 2nd control point on a cubic curve
* @param y2 The y-coordinate of the 2nd control point on a cubic curve
* @param x3 The x-coordinate of the end point on a cubic curve
* @param y3 The y-coordinate of the end point on a cubic curve
*/
public void cubicTo(float x1, float y1, float x2, float y2,
                    float x3, float y3) {
  isSimplePath = false;
  nCubicTo(mNativePath, x1, y1, x2, y2, x3, y3);
}
```

效果如下，由于模拟器上无法出发多点触碰，因此此处演示只有控制点1移动。

![](/assets/2.gif)

# 运动轨迹计算

幸运的是前人已经研究出[De Casteljau算法](http://pages.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/Bezier/de-casteljau.html)来获取贝塞尔曲线上的点，算法比较复杂，公式如下。后续又有人根据公式推理出简化版[二阶、三阶贝塞尔曲线的计算方程](http://devmag.org.za/2011/04/05/bzier-curves-a-tutorial/)，通过这些公式可以获取贝塞尔曲线上任何一个点的坐标。

(https://github.com/venshine/BezierMaker)

![](/assets/1.jpg)

```java
public class BezierUtil {

    /**
     * 二阶贝塞尔曲线B(t) = (1 - t)^2 * P0 + 2t * (1 - t) * P1 + t^2 * P2, t ∈ [0,1]
     *
     * @param t  曲线长度比例
     * @param p0 起始点
     * @param p1 控制点
     * @param p2 终止点
     * @return t对应的点
     */
    public static PointF CalculateBezierPointForQuadratic(float t, PointF p0, PointF p1, PointF p2) {
        PointF point = new PointF();
        float temp = 1 - t;
        point.x = temp * temp * p0.x + 2 * t * temp * p1.x + t * t * p2.x;
        point.y = temp * temp * p0.y + 2 * t * temp * p1.y + t * t * p2.y;
        return point;
    }

    /**
     * 三阶贝塞尔曲线B(t) = P0 * (1-t)^3 + 3 * P1 * t * (1-t)^2 + 3 * P2 * t^2 * (1-t) + P3 * t^3, t ∈ [0,1]
     *
     * @param t  曲线长度比例
     * @param p0 起始点
     * @param p1 控制点1
     * @param p2 控制点2
     * @param p3 终止点
     * @return t对应的点
     */
    public static PointF CalculateBezierPointForCubic(float t, PointF p0, PointF p1, PointF p2, PointF p3) {
        PointF point = new PointF();
        float temp = 1 - t;
        point.x = p0.x * temp * temp * temp + 3 * p1.x * t * temp * temp + 3 * p2.x * t * t * temp + p3.x * t * t * t;
        point.y = p0.y * temp * temp * temp + 3 * p1.y * t * temp * temp + 3 * p2.y * t * t * temp + p3.y * t * t * t;
        return point;
    }
}
```

# 用PathMeasure API实现轨迹计算

```java
PathMeasure pathMeasure = new PathMeasure();
pathMeasure.setPath(path, false);
float totalLength = pathMeasure.getLength();
float dist; // [0,totalLength]
pathMeasure.getPosTan(dist, curPoint, curTan);
float angle = Math.atan2(curTan[0], curTan[1]);
```

原文链接：[https://blog.csdn.net/itermeng/article/details/80264577](https://blog.csdn.net/itermeng/article/details/80264577)

## Articals:

[https://javascript.info/bezier-curve#control-points](https://javascript.info/bezier-curve#control-points)